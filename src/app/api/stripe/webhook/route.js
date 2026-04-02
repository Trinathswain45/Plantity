import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/mongodb";
import { sendOrderUpdate } from "@/lib/notify";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event;
  const payload = await req.text();

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session?.metadata?.orderId;
      if (orderId) {
        const db = await getDb();
        const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
        await db.collection("orders").updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              paymentStatus: "paid",
              status: "paid",
              paidAt: new Date(),
              orderStatus: order?.orderStatus === "placed" ? "confirmed" : (order?.orderStatus || "confirmed"),
            },
            $push: {
              timeline: {
                status: order?.orderStatus === "placed" ? "confirmed" : (order?.orderStatus || "confirmed"),
                at: new Date(),
                note: "Payment confirmed",
                by: "system",
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
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
