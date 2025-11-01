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
  const ref = storeRef.collection("shipments").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const prev = snap.data() as any;
  const now = new Date().toISOString();

  const update: any = { updated_at: now };

  // allow updating basic fields
  const allowed = [
    "status",
    "tracking_number",
    "carrier_name",
    "service_code",
    "cost",
    "notes",
    "address_from",
    "address_to",
    "estimated_delivery",
    "shipped_at",
    "delivered_at",
  ];
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  // append event if provided
  if (body.add_event && typeof body.add_event === "object") {
    const events = Array.isArray(prev.events) ? prev.events.slice() : [];
    const newEvent = {
      event_id: events.length ? Math.max(...events.map((e: any) => e.event_id || 0)) + 1 : 1,
      status: body.add_event.status || body.status || prev.status || "created",
      location: body.add_event.location || "-",
      description: body.add_event.description || "Status diperbarui",
      occurred_at: body.add_event.occurred_at || now,
    };
    events.push(newEvent);
    update.events = events;
  }

  // auto timestamps on status
  if (typeof body.status === "string") {
    if (body.status === "delivered" && !update.delivered_at) update.delivered_at = now;
    if (body.status === "picked_up" && !update.shipped_at) update.shipped_at = now;
  }

  await ref.set(update, { merge: true });

  // Activity logging
  const activities: Array<{ type: string; description: string; meta?: any }> = [];
  if (typeof body.status === "string" && body.status !== prev.status) {
    if (body.status === "delivered") {
      activities.push({
        type: "mark_delivered",
        description: `Pengiriman ${prev.tracking_number || id} ditandai terkirim.`,
      });
    } else if (body.status === "returned") {
      activities.push({
        type: "mark_returned",
        description: `Pengiriman ${prev.tracking_number || id} ditandai dikembalikan.`,
      });
    } else {
      activities.push({
        type: "update_tracking",
        description: `Status pengiriman ${prev.tracking_number || id} diperbarui ke '${body.status}'.`,
      });
    }
  }
  if (body.add_event) {
    activities.push({
      type: "update_tracking",
      description: `Tracking pengiriman ${prev.tracking_number || id} diperbarui.`,
    });
  }
  if (typeof body.tracking_number === "string" && body.tracking_number !== prev.tracking_number) {
    activities.push({
      type: "update_shipment",
      description: `Nomor resi diperbarui menjadi ${body.tracking_number}.`,
    });
  }

  for (const act of activities) {
    await storeRef.collection("activities").add({ ...act, timestamp: now, meta: { shipment_id: id } });
  }

  const after = await ref.get();
  return NextResponse.json({ id, ...after.data() });
}
