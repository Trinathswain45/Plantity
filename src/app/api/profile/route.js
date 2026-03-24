import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const PROFILE_FIELDS = ["name", "email", "phone", "address", "city", "pincode", "notes"];

export async function GET(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const db = await getDb();
    const userDoc = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user.sub) }, { projection: PROFILE_FIELDS.reduce((acc, key) => ({ ...acc, [key]: 1 }), {}) });

    const profile = {
      name: userDoc?.name || "",
      email: userDoc?.email || user.email || "",
      phone: userDoc?.phone || user.phone || "",
      address: userDoc?.address || "",
      city: userDoc?.city || "",
      pincode: userDoc?.pincode || "",
      notes: userDoc?.notes || "",
    };

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(req) {
  const { user, response } = requireAuth(req);
  if (response) return response;

  try {
    const body = await req.json();
    const updates = {};

    PROFILE_FIELDS.forEach((field) => {
      if (typeof body?.[field] === "string") {
        updates[field] = body[field].trim();
      }
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No profile fields provided" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const db = await getDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(user.sub) },
      { $set: updates }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
