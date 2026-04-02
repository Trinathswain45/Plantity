import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { sendOrderUpdate } from "@/lib/notify";

export const runtime = "nodejs";

const PROFILE_FIELDS = ["name", "email", "phone", "address", "city", "pincode", "notes"];
const ORDER_STATUSES = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
const PENDING_STATUSES = ["pending", "payment_pending", "upi_pending", "cod_pending"];

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

export async function POST(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const body = await req.json();
    const items = body?.items || [];
    const totals = body?.totals || {};
    const delivery = body?.delivery || {};
    const paymentMethod = body?.paymentMethod || "cod";
    const paymentMeta = body?.paymentMeta || {};
    const paymentConfirmed = Boolean(body?.paymentConfirmed);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const db = await getDb();
    const statusByMethod = {
      cod: "cod_pending",
      upi: "upi_pending",
      razorpay: "pending",
      stripe: "pending",
    };

    const paymentStatus = paymentConfirmed ? "paid" : (statusByMethod[paymentMethod] || "pending");
    const orderStatus = "placed";

    const order = {
      userId: user.sub,
      email: user.email || null,
      phone: user.phone || null,
      items,
      totals,
      delivery,
      paymentMethod,
      paymentMeta,
      paymentStatus,
      orderStatus,
      status: paymentStatus,
      timeline: initTimeline(orderStatus, "Order placed", user),
      createdAt: new Date(),
      paidAt: paymentConfirmed ? new Date() : null,
    };

    const result = await db.collection("orders").insertOne(order);

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

    if (paymentConfirmed || paymentMethod === "cod") {
      const methodLabel = paymentMethod === "cod" ? "Cash On Delivery" : paymentMethod === "upi" ? "UPI" : "Online";
      const messageNote = paymentMethod === "cod"
        ? "Pay on delivery."
        : "Payment confirmed. We are preparing your order.";

      await sendOrderUpdate({
        email: order.email,
        phone: order.phone,
        subject: "Plantity order confirmed",
        message: `Your order ${result.insertedId} is confirmed with ${methodLabel}. ${messageNote}`,
      });
    }

    return NextResponse.json({ ok: true, orderId: result.insertedId, orderStatus, paymentStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const includePending = searchParams.get("includePending") === "true";

    const query = { userId: user.sub };
    if (!includePending) {
      query.$and = [
        { $or: [{ paymentStatus: { $exists: false } }, { paymentStatus: { $nin: PENDING_STATUSES } }] },
        { $or: [{ status: { $exists: false } }, { status: { $nin: PENDING_STATUSES } }] },
      ];
    }

    const db = await getDb();
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ ok: true, orders, orderStatuses: ORDER_STATUSES });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
