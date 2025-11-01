import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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
  const reviewRef = storeRef.collection("reviews").doc(id);
  const snap = await reviewRef.get();
  if (!snap.exists) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const prev = snap.data() as any;
  const now = new Date().toISOString();

  const updates: any = { updated_at: now };
  const activities: Array<{ type: string; description: string; meta?: any }> = [];

  // reply creation / update
  if (typeof body.reply_message === "string") {
    const wasReplied = !!prev?.reply?.message;
    updates.reply = {
      reply_id: prev?.reply?.reply_id || id,
      seller_id: uid,
      seller_name: prev?.reply?.seller_name || (prev?.store_name || "Seller"),
      message: body.reply_message,
      replied_at: now,
    };
    activities.push({
      type: wasReplied ? "edit_reply_review" : "reply_review",
      description: `${wasReplied ? "Mengubah" : "Membalas"} ulasan pada produk '${prev?.product_name || ""}'.`,
      meta: { review_id: id, product_id: prev?.product_id },
    });
  }

  // delete reply
  if (body.delete_reply === true) {
    updates.reply = FieldValue.delete();
    activities.push({
      type: "delete_reply_review",
      description: `Menghapus balasan ulasan pada produk '${prev?.product_name || ""}'.`,
      meta: { review_id: id, product_id: prev?.product_id },
    });
  }

  // visibility toggle
  if (typeof body.is_visible === "boolean" && body.is_visible !== prev.is_visible) {
    updates.is_visible = body.is_visible;
    activities.push({
      type: body.is_visible ? "mark_review_visible" : "hide_review",
      description: `${body.is_visible ? "Menampilkan" : "Menyembunyikan"} ulasan pada produk '${prev?.product_name || ""}'.`,
      meta: { review_id: id, product_id: prev?.product_id },
    });
  }

  // report flag
  if (typeof body.reported === "boolean" && body.reported !== prev.reported) {
    updates.reported = body.reported;
    activities.push({
      type: body.reported ? "report_review" : "unreport_review",
      description: `${body.reported ? "Menandai" : "Menghapus tanda"} laporan untuk ulasan pada produk '${prev?.product_name || ""}'.`,
      meta: { review_id: id, product_id: prev?.product_id },
    });
  }

  // helpful count delta
  if (typeof body.helpful_delta === "number" && body.helpful_delta !== 0) {
    updates.helpful_count = FieldValue.increment(body.helpful_delta);
    activities.push({
      type: "mark_helpful",
      description: `Ulasan ditandai bermanfaat (${body.helpful_delta > 0 ? "+" : ""}${body.helpful_delta}).`,
      meta: { review_id: id },
    });
  }

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  await reviewRef.set(updates, { merge: true });

  // write activities
  for (const act of activities) {
    await storeRef.collection("activities").add({ ...act, timestamp: now });
  }

  const after = await reviewRef.get();
  return NextResponse.json({ id, ...after.data() });
}
