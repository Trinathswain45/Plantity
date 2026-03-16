import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashOtp } from "@/lib/otp";
import { signJwt } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase() || null;
    const phone = body?.phone?.trim() || null;
    const code = body?.code?.trim() || "";

    if ((!email && !phone) || !code) {
      return NextResponse.json({ error: "Email or phone and code are required" }, { status: 400 });
    }

    const db = await getDb();
    const codeHash = hashOtp(code);

    const otp = await db.collection("otp_codes").findOne({
      email,
      phone,
      codeHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    await db.collection("otp_codes").updateOne({ _id: otp._id }, { $set: { used: true } });

    let user = await db.collection("users").findOne({ $or: [{ email }, { phone }] });

    if (!user) {
      const insert = await db.collection("users").insertOne({
        email,
        phone,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      user = { _id: insert.insertedId, email, phone };
    } else {
      await db.collection("users").updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    }

    const token = signJwt({
      sub: user._id.toString(),
      email: user.email || null,
      phone: user.phone || null,
    });

    return NextResponse.json({
      ok: true,
      token,
      user: { id: user._id.toString(), email: user.email || null, phone: user.phone || null },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
