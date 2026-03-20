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

    const channelResult = await sendOtp({ email, phone, code });
    const channel =
      typeof channelResult === "string" ? channelResult : channelResult?.channel || "unknown";

    return NextResponse.json({ ok: true, channel });
  } catch (error) {
    console.error(error);
    const detail = process.env.NODE_ENV !== "production" ? error?.message : undefined;
    return NextResponse.json({ error: "Failed to send code", detail }, { status: 500 });
  }
}
