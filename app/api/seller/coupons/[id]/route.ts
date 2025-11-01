import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function getUidFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch (e) {
    return null;
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const storeRef = adminDb.collection("stores").doc(uid);
  const ref = storeRef.collection("coupons").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const prev = snap.data() as any;
  const now = new Date().toISOString();

  const allowed = [
    "code",
    "type",
    "value",
    "max_discount",
    "min_order_amount",
    "start_at",
    "end_at",
    "usage_limit",
    "per_user_limit",
    "is_active",
    "title",
    "description",
  ];
  const update: any = { updated_at: now };
  for (const k of allowed) if (k in body) update[k] = body[k];

  await ref.set(update, { merge: true });

  const acts: Array<{ type: string; description: string }> = [];
  if (typeof body.is_active === "boolean" && body.is_active !== prev.is_active) {
    acts.push({
      type: body.is_active ? "activate_coupon" : "deactivate_coupon",
      description: `${body.is_active ? "Mengaktifkan" : "Menonaktifkan"} kupon '${prev.code}'.`,
    });
  } else {
    acts.push({ type: "update_coupon", description: `Memperbarui kupon '${prev.code}'.` });
  }
  for (const a of acts) await storeRef.collection("activities").add({ ...a, timestamp: now, meta: { coupon_id: id } });

  const after = await ref.get();
  return NextResponse.json({ id, ...after.data() });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const storeRef = adminDb.collection("stores").doc(uid);
  const ref = storeRef.collection("coupons").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const prev = snap.data() as any;
  await ref.delete();
  const now = new Date().toISOString();
  await storeRef.collection("activities").add({
    type: "delete_coupon",
    description: `Menghapus kupon '${prev.code}'.`,
    timestamp: now,
    meta: { coupon_id: id },
  });
  return NextResponse.json({ success: true });
}
