import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
  await adminDb.doc(`stores/${uid}/security/main/login_devices/${params.id}`).delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/profile/security/devices/[id] DELETE error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
