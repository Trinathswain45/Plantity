import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const PROFILE_FIELDS = ["name", "email", "phone", "address", "city", "pincode", "notes"];

export async function POST(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const body = await req.json();
    const items = body?.items || [];
    const totals = body?.totals || {};
    const delivery = body?.delivery || {};
    const providedOrderId = body?.orderId || null;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
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
        status: "payment_pending",
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

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity) || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user.email || undefined,
      success_url: `${appUrl}/profile?status=success&orderId=${orderId}`,
      cancel_url: `${appUrl}/cart?status=cancelled&orderId=${orderId}`,
      metadata: { orderId, userId: user.sub },
    });

    await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { stripeSessionId: session.id, status: "payment_pending" } }
    );

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id, orderId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
