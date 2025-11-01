import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const doc = await adminDb.doc(`stores/${uid}/settings/chat`).get();
    const data = doc.exists ? doc.data() : {};
    return NextResponse.json({ settings: data || {} });
  } catch (err: any) {
    console.error("/chat/settings GET error", err);
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

    if (body.preferences) updates.preferences = body.preferences;
    if (body.automated_replies) updates.automated_replies = body.automated_replies;
    updates.updated_at = new Date();

    await adminDb.doc(`stores/${uid}/settings/chat`).set(updates, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/chat/settings PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
