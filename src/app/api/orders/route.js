import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { sendOrderUpdate } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const body = await req.json();
    const items = body?.items || [];
    const totals = body?.totals || {};
    const delivery = body?.delivery || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const db = await getDb();
    const order = {
      userId: user.sub,
      email: user.email || null,
      phone: user.phone || null,
      items,
      totals,
      delivery,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    await sendOrderUpdate({
      email: order.email,
      phone: order.phone,
      subject: "Plantity order placed",
      message: `Your order ${result.insertedId} has been placed and is awaiting payment confirmation.`,
    });

    return NextResponse.json({ ok: true, orderId: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const db = await getDb();
    const orders = await db
      .collection("orders")
      .find({ userId: user.sub })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
