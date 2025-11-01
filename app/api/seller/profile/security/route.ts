import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const secDoc = await adminDb.doc(`stores/${uid}/security/main`).get();
    const devSnap = await adminDb
      .collection(`stores/${uid}/security/main/login_devices`)
      .orderBy("last_login", "desc")
      .get();
    const login_devices = devSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const histSnap = await adminDb
      .collection(`stores/${uid}/security/main/login_history`)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();
    const login_history = histSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ security_settings: { ...(secDoc.exists ? secDoc.data() : {}), login_devices, login_history } });
  } catch (err: any) {
    console.error("/profile/security GET error", err);
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
    if (body.two_factor_enabled !== undefined) updates.two_factor_enabled = !!body.two_factor_enabled;
    if (body.password_last_changed !== undefined) updates.password_last_changed = body.password_last_changed;
    await adminDb.doc(`stores/${uid}/security/main`).set({ ...updates, updated_at: new Date() }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/profile/security PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
