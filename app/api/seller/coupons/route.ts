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

function isBetween(now: number, startAt?: string | null, endAt?: string | null) {
  const s = startAt ? Date.parse(startAt) : undefined;
  const e = endAt ? Date.parse(endAt) : undefined;
  if (s && now < s) return false;
  if (e && now > e) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });

  const now = Date.now();
  const couponsSnap = await storeRef.collection("coupons").orderBy("created_at", "desc").get();
  const coupons = couponsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const redemptionsSnap = await storeRef.collection("coupon_redemptions").orderBy("redeemed_at", "desc").limit(50).get();
  const coupon_redemptions = redemptionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const total_coupons = coupons.length;
  const active_coupons = coupons.filter((c: any) => c.is_active && isBetween(now, c.start_at, c.end_at)).length;
  const expired_coupons = coupons.filter((c: any) => c.end_at && Date.parse(c.end_at) < now).length;
  const used_coupons = coupons.reduce((acc: number, c: any) => acc + (c.redemption_count || 0), 0);
  const total_discount_granted = coupon_redemptions.reduce((acc: number, r: any) => acc + (r.discount_amount || 0), 0);

  const coupon_statistics = { total_coupons, active_coupons, expired_coupons, used_coupons, total_discount_granted };

  const store = storeSnap.data() as any;
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    total_coupons,
    active_coupons,
  };

  const actsSnap = await storeRef.collection("activities").orderBy("timestamp", "desc").limit(10).get();
  const activity_log = actsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a: any) => ["create_coupon", "update_coupon", "delete_coupon", "coupon_redeemed"].includes(a.type));

  return NextResponse.json({ store_info, coupons, coupon_statistics, coupon_redemptions, activity_log });
}

export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const required = [
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
  for (const k of required) if (!(k in body)) return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });

  const now = new Date().toISOString();
  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });

  const doc: any = {
    code: String(body.code),
    type: body.type, // percentage | fixed
    value: Number(body.value),
    max_discount: Number(body.max_discount),
    min_order_amount: Number(body.min_order_amount),
    start_at: body.start_at,
    end_at: body.end_at,
    usage_limit: Number(body.usage_limit),
    per_user_limit: Number(body.per_user_limit),
    is_active: !!body.is_active,
    title: body.title,
    description: body.description,
    redemption_count: 0,
    created_at: now,
    updated_at: now,
  };

  const ref = await storeRef.collection("coupons").add(doc);
  await storeRef.collection("activities").add({
    type: "create_coupon",
    description: `Menambahkan kupon baru '${doc.code}'.`,
    timestamp: now,
    meta: { coupon_id: ref.id },
  });

  const snap = await ref.get();
  return NextResponse.json({ id: snap.id, ...snap.data() });
}
