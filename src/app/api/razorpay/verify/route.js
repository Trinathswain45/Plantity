import { NextResponse } from "next/server";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { sendOrderUpdate } from "@/lib/notify";

export const runtime = "nodejs";

function buildSignature(orderId, paymentId, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export async function POST(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const body = await req.json();
    const orderId = body?.orderId;
    const razorpayOrderId = body?.razorpayOrderId;
    const razorpayPaymentId = body?.razorpayPaymentId;
    const razorpaySignature = body?.razorpaySignature;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      return NextResponse.json({ error: "Razorpay is not configured" }, { status: 500 });
    }

    const expected = buildSignature(razorpayOrderId, razorpayPaymentId, secret);
    if (expected !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus !== "paid") {
      const nextStatus = order?.orderStatus === "placed" ? "confirmed" : (order?.orderStatus || "confirmed");

      await db.collection("orders").updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentStatus: "paid",
            status: "paid",
            paidAt: new Date(),
            orderStatus: nextStatus,
            paymentMethod: "razorpay",
            paymentMeta: {
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
            },
          },
          $push: {
            timeline: {
              status: nextStatus,
              at: new Date(),
              note: "Payment confirmed",
              by: user?.email || user?.phone || "system",
            },
          },
        }
      );

      await sendOrderUpdate({
        email: order?.email,
        phone: order?.phone,
        subject: "Plantity payment confirmed",
        message: `Your payment for order ${orderId} is confirmed. We are preparing your food now.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
