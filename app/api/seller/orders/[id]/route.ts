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
  const orderRef = storeRef.collection("orders").doc(id);
  const snap = await orderRef.get();
  if (!snap.exists) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const prev = snap.data() as any;
  const now = new Date().toISOString();

  // Allowed updates: status, payment_status, seller_notes, shipment_info (tracking, status, events push), tracking_number, shipping_method
  const update: any = { ...body, updated_at: now };

  // Normalize shipment updates
  if (body.shipment_info) {
    update.shipment_info = {
      ...(prev.shipment_info || {}),
      ...(body.shipment_info || {}),
    };
  }
  if (typeof body.tracking_number === "string") {
    update.shipment_info = {
      ...(update.shipment_info || prev.shipment_info || {}),
      tracking_number: body.tracking_number,
    };
  }

  await orderRef.set(update, { merge: true });

  // Activity logging
  const activities: Array<{ type: string; description: string; meta?: any }> = [];

  if (typeof body.status === "string" && body.status !== prev.status) {
    activities.push({
      type: "update_order_status",
      description: `Pesanan ${prev.order_number || id} diubah menjadi '${body.status}'.`,
      meta: { from: prev.status, to: body.status },
    });
  }
  if (body.shipment_info && body.shipment_info.tracking_number && body.shipment_info.tracking_number !== prev?.shipment_info?.tracking_number) {
    activities.push({
      type: "shipment_created",
      description: `Pengiriman dibuat untuk pesanan ${prev.order_number || id} dengan resi ${body.shipment_info.tracking_number}.`,
      meta: { tracking_number: body.shipment_info.tracking_number },
    });
  }
  if (typeof body.payment_status === "string" && body.payment_status !== prev.payment_status) {
    activities.push({
      type: body.payment_status === "paid" ? "payment_confirmed" : "payment_status_updated",
      description: `Status pembayaran pesanan ${prev.order_number || id} menjadi '${body.payment_status}'.`,
    });
  }

  for (const act of activities) {
    await storeRef.collection("activities").add({ ...act, timestamp: now, meta: act.meta || { order_id: id } });
  }

  const after = await orderRef.get();
  return NextResponse.json({ id, ...after.data() });
}
