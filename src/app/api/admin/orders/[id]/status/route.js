import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { sendOrderUpdate } from "@/lib/notify";

export const runtime = "nodejs";

const ORDER_STATUSES = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
const STATUS_MESSAGES = {
  placed: "Your order has been placed.",
  confirmed: "Your order is confirmed by the restaurant.",
  preparing: "Your order is being prepared.",
  out_for_delivery: "Your order is out for delivery.",
  delivered: "Your order has been delivered. Enjoy your meal!",
  cancelled: "Your order has been cancelled. If this is unexpected, contact support.",
};

export async function PATCH(req, { params }) {
  const { user, response } = requireAdmin(req);
  if (response) return response;

  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const body = await req.json();
    const nextStatus = body?.status;
    const note = body?.note?.trim();

    if (!ORDER_STATUSES.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: { orderStatus: nextStatus, updatedAt: new Date() },
        $push: {
          timeline: {
            status: nextStatus,
            at: new Date(),
            note: note || STATUS_MESSAGES[nextStatus],
            by: user?.email || user?.phone || "admin",
          },
        },
      }
    );

    await sendOrderUpdate({
      email: order?.email,
      phone: order?.phone,
      subject: "Plantity order update",
      message: `Order ${orderId}: ${note || STATUS_MESSAGES[nextStatus]}`,
    });

    return NextResponse.json({ ok: true, orderId, status: nextStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
