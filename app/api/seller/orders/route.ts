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

export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) {
    return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });
  }

  const ordersSnap = await storeRef.collection("orders").orderBy("order_date", "desc").get();
  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Stats
  const total_orders = orders.length;
  const countBy = (key: string, val: string) => orders.filter((o: any) => o[key] === val).length;
  const pending = countBy("status", "pending");
  const processing = countBy("status", "processing");
  const shipped = countBy("status", "shipped");
  const completed = countBy("status", "completed") + countBy("status", "delivered");
  const canceled = countBy("status", "canceled");
  const total_revenue = orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
  const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

  const order_statistics = {
    total_orders,
    pending,
    processing,
    shipped,
    completed,
    canceled,
    total_revenue,
    average_order_value,
  };

  const store = storeSnap.data() as any;
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    total_orders,
    total_revenue,
    pending_orders: pending,
    processing_orders: processing,
    completed_orders: completed,
  };

  // recent activities (order-related)
  const actsSnap = await storeRef.collection("activities").orderBy("timestamp", "desc").limit(10).get();
  const activity_log = actsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a: any) => ["update_order_status", "shipment_created", "payment_confirmed", "order_created"].includes(a.type));

  return NextResponse.json({ store_info, orders, order_statistics, activity_log });
}
