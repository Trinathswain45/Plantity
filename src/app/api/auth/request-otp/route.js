import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtp } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase() || null;
    const phone = body?.phone?.trim() || null;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const code = generateOtp();
    const db = await getDb();

    await db.collection("otp_codes").insertOne({
      email,
      phone,
      codeHash: hashOtp(code),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: false,
    });

    const channel = await sendOtp({ email, phone, code });

    return NextResponse.json({ ok: true, channel });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
