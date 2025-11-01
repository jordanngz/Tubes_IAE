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

function progressFromStatus(status: string) {
  switch (status) {
    case "created":
      return 10;
    case "picked_up":
      return 25;
    case "in_transit":
      return 60;
    case "delivered":
      return 100;
    case "failed":
    case "returned":
      return 100;
    default:
      return 10;
  }
}

export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });

  const shipmentsSnap = await storeRef.collection("shipments").orderBy("created_at", "desc").get();
  const shipments = shipmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const total_shipments = shipments.length;
  const countBy = (status: string) => shipments.filter((s: any) => (s.status || "created") === status).length;
  const total_shipping_cost = shipments.reduce((acc: number, s: any) => acc + (s.cost || 0), 0);

  const shipment_summary = {
    total_shipments,
    created: countBy("created"),
    picked_up: countBy("picked_up"),
    in_transit: countBy("in_transit"),
    delivered: countBy("delivered"),
    failed: countBy("failed"),
    returned: countBy("returned"),
    total_shipping_cost,
  };

  const store = storeSnap.data() as any;
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    total_shipments,
    active_shipments: countBy("in_transit") + countBy("picked_up") + countBy("created"),
    delivered_shipments: countBy("delivered"),
    returned_shipments: countBy("returned"),
  };

  const tracking_overview = shipments.slice(0, 10).map((s: any) => {
    const events: any[] = Array.isArray(s.events) ? s.events : [];
    const last = events[events.length - 1] || null;
    return {
      shipment_id: s.id,
      tracking_number: s.tracking_number || s?.shipment_info?.tracking_number || "",
      status: s.status || s?.shipment_info?.status || "created",
      last_update: last?.occurred_at || s.updated_at || s.created_at,
      current_location: last?.location || "-",
      progress_percent: progressFromStatus(s.status || s?.shipment_info?.status || "created"),
    };
  });

  // recent activities (shipment-related)
  const actsSnap = await storeRef.collection("activities").orderBy("timestamp", "desc").limit(10).get();
  const activity_log = actsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a: any) => ["create_shipment", "update_tracking", "mark_delivered", "mark_returned"].includes(a.type));

  // Optional store-level courier settings
  const courier_settings = store?.courier_settings || {
    available_carriers: [
      { name: "JNE", services: ["REG", "YES"], is_active: true },
      { name: "POS Indonesia", services: ["Kilat", "Express"], is_active: false },
      { name: "SiCepat", services: ["Regular", "Best"], is_active: true },
    ],
    default_carrier: "JNE",
    auto_sync_with_api: false,
    last_sync_at: new Date().toISOString(),
  };

  return NextResponse.json({ store_info, shipments, shipment_summary, courier_settings, tracking_overview, activity_log });
}

export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // minimal required fields
  const required = ["order_id", "order_number", "buyer_name", "buyer_contact", "carrier_name", "service_code", "tracking_number", "cost", "address_from", "address_to"];
  for (const k of required) {
    if (!(k in body)) return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
  }

  const now = new Date().toISOString();
  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });

  const shipmentDoc: any = {
    order_id: body.order_id,
    order_shop_id: body.order_shop_id || null,
    order_number: body.order_number,
    buyer_name: body.buyer_name,
    buyer_contact: body.buyer_contact,
    carrier_name: body.carrier_name,
    service_code: body.service_code,
    tracking_number: body.tracking_number,
    status: body.status || "created",
    cost: typeof body.cost === "number" ? body.cost : Number(body.cost || 0),
    shipped_at: body.shipped_at || null,
    delivered_at: body.delivered_at || null,
    address_from: body.address_from,
    address_to: body.address_to,
    events: Array.isArray(body.events) ? body.events : [
      {
        event_id: 1,
        status: "created",
        location: body.address_from?.city || "Origin",
        description: "Label pengiriman dibuat.",
        occurred_at: now,
      },
    ],
    estimated_delivery: body.estimated_delivery || null,
    notes: body.notes || { buyer_notes: null, seller_notes: null },
    created_at: now,
    updated_at: now,
  };

  const newRef = await storeRef.collection("shipments").add(shipmentDoc);

  // Log activity
  await storeRef.collection("activities").add({
    type: "create_shipment",
    description: `Pengiriman baru dibuat untuk pesanan ${shipmentDoc.order_number} via ${shipmentDoc.carrier_name} ${shipmentDoc.service_code}.`,
    timestamp: now,
    meta: { shipment_id: newRef.id, tracking_number: shipmentDoc.tracking_number },
  });

  const createdSnap = await newRef.get();
  return NextResponse.json({ id: createdSnap.id, ...createdSnap.data() });
}
