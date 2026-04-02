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

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.email && adminEmails.includes(String(user.email).toLowerCase())) return true;
  return false;
}

export function requireAdmin(req) {
  const { user, response } = requireAuth(req);
  if (response) return { user: null, response };
  if (!isAdmin(user)) {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}
