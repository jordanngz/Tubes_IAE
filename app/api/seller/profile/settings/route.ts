import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const doc = await adminDb.doc(`stores/${uid}/settings/account`).get();
    return NextResponse.json({ settings: doc.exists ? doc.data() : {} });
  } catch (err: any) {
    console.error("/profile/settings GET error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const body = await request.json();
    const updates: any = {};
    const allowed = ["language", "timezone", "currency", "dark_mode", "two_factor_auth", "notification_preferences"];
    allowed.forEach((k) => {
      if (body[k] !== undefined) updates[k] = body[k];
    });
    updates.last_updated = new Date();
    await adminDb.doc(`stores/${uid}/settings/account`).set(updates, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/profile/settings PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
