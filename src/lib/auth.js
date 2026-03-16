import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d", ...options });
}

export function verifyJwt(token) {
  return jwt.verify(token, jwtSecret);
}

export function getAuthUser(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    return verifyJwt(token);
  } catch {
    return null;
  }
}

export function requireAuth(req) {
  const user = getAuthUser(req);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
