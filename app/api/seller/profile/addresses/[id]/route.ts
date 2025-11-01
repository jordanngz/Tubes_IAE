import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const body = await request.json();
    const updates: any = {};
    const allowed = [
      "label",
      "recipient_name",
      "phone",
      "address_line1",
      "address_line2",
      "city",
      "state",
      "postal_code",
      "country",
      "is_default",
    ];
    allowed.forEach((k) => {
      if (body[k] !== undefined) updates[k] = body[k];
    });
    if (updates.is_default) {
      const col = adminDb.collection(`stores/${uid}/addresses`);
      const snap = await col.where("is_default", "==", true).get();
      const batch = adminDb.batch();
      snap.forEach((d) => batch.update(d.ref, { is_default: false }));
      await batch.commit();
    }
    await adminDb.doc(`stores/${uid}/addresses/${params.id}`).set(updates, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/profile/addresses/[id] PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    await adminDb.doc(`stores/${uid}/addresses/${params.id}`).delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/profile/addresses/[id] DELETE error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
