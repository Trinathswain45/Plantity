import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const PROFILE_FIELDS = ["name", "email", "phone", "address", "city", "pincode", "notes"];

function initTimeline(status, note, user) {
  return [
    {
      status,
      at: new Date(),
      note,
      by: user?.email || user?.phone || "system",
    },
  ];
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const body = await req.json();
    const items = body?.items || [];
    const totals = body?.totals || {};
    const delivery = body?.delivery || {};
    const providedOrderId = body?.orderId || null;

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json({ error: "Razorpay is not configured" }, { status: 500 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const amountValue = Number(totals.total || 0);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const db = await getDb();
    let orderId = providedOrderId;

    if (!orderId) {
      const insert = await db.collection("orders").insertOne({
        userId: user.sub,
        email: user.email || null,
        phone: user.phone || null,
        items,
        totals,
        delivery,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        orderStatus: "placed",
        status: "payment_pending",
        timeline: initTimeline("placed", "Order placed", user),
        createdAt: new Date(),
      });
      orderId = insert.insertedId.toString();

      const profileUpdates = {};
      PROFILE_FIELDS.forEach((field) => {
        if (typeof delivery?.[field] === "string" && delivery[field].trim()) {
          profileUpdates[field] = delivery[field].trim();
        }
      });
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updatedAt = new Date();
        await db.collection("users").updateOne(
          { _id: new ObjectId(user.sub) },
          { $set: profileUpdates }
        );
      }
    }

    const amount = Math.round(amountValue * 100);
    const rpOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: orderId,
      notes: { orderId, userId: user.sub },
    });

    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { razorpayOrderId: rpOrder.id, paymentStatus: "pending", status: "payment_pending" } }
    );

    return NextResponse.json({
      ok: true,
      orderId,
      razorpayOrderId: rpOrder.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
  }
}
