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
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const storeRef = adminDb.collection("stores").doc(uid);
  const prodRef = storeRef.collection("products").doc(id);
  const snap = await prodRef.get();
  if (!snap.exists) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const prev = snap.data() as any;
  const update: any = { ...body, updated_at: new Date().toISOString() };

  await prodRef.set(update, { merge: true });

  // If stock changed, log update_stock activity
  if (typeof body.stock === "number" && body.stock !== prev.stock) {
    await storeRef.collection("activities").add({
      type: "update_stock",
      description: `Mengubah stok produk '${prev.name}' dari ${prev.stock} menjadi ${body.stock}.`,
      timestamp: new Date().toISOString(),
      meta: { product_id: id, from: prev.stock, to: body.stock },
    });
  } else {
    await storeRef.collection("activities").add({
      type: "update_product",
      description: `Memperbarui produk '${prev.name}'.`,
      timestamp: new Date().toISOString(),
      meta: { product_id: id },
    });
  }

  const after = await prodRef.get();
  return NextResponse.json({ id, ...after.data() });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const storeRef = adminDb.collection("stores").doc(uid);
  const prodRef = storeRef.collection("products").doc(id);
  const snap = await prodRef.get();
  if (snap.exists) {
    const data = snap.data() as any;
    await prodRef.delete();
    await storeRef.collection("activities").add({
      type: "delete_product",
      description: `Menghapus produk '${data?.name || id}'.`,
      timestamp: new Date().toISOString(),
      meta: { product_id: id },
    });
  }

  return NextResponse.json({ ok: true });
}
