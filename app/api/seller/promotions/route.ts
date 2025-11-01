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
  const promosSnap = await storeRef.collection("promotions").orderBy("created_at", "desc").get();
  const promotions = promosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const total_promotions = promotions.length;
  const active_promotions = promotions.filter((p: any) => p.is_active && isBetween(now, p.start_at, p.end_at)).length;
  const expired_promotions = promotions.filter((p: any) => p.end_at && Date.parse(p.end_at) < now).length;
  const upcoming_promotions = promotions.filter((p: any) => p.start_at && Date.parse(p.start_at) > now).length;
  const total_discount_given = promotions.reduce((acc: number, p: any) => acc + (p.statistics?.total_discount_given || 0), 0);

  const promotion_statistics = {
    total_promotions,
    active_promotions,
    expired_promotions,
    upcoming_promotions,
    total_discount_given,
  };

  const store = storeSnap.data() as any;
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    total_promotions,
    active_promotions,
  };

  const actsSnap = await storeRef.collection("activities").orderBy("timestamp", "desc").limit(10).get();
  const activity_log = actsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a: any) => ["create_promotion", "update_promotion", "activate_promotion", "deactivate_promotion", "delete_promotion"].includes(a.type));

  return NextResponse.json({ store_info, promotions, promotion_statistics, activity_log });
}

export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const required = ["name", "description", "type", "value", "start_at", "end_at", "is_active"];
  for (const k of required) if (!(k in body)) return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });

  const now = new Date().toISOString();
  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });

  const doc: any = {
    name: body.name,
    description: body.description,
    type: body.type, // percentage | fixed
    value: Number(body.value),
    start_at: body.start_at,
    end_at: body.end_at,
    is_active: !!body.is_active,
    banner: body.banner || null,
    applied_to: Array.isArray(body.applied_to) ? body.applied_to : [],
    statistics: { total_sales_during_promo: 0, total_discount_given: 0, unique_buyers: 0 },
    created_at: now,
    updated_at: now,
  };

  const ref = await storeRef.collection("promotions").add(doc);
  await storeRef.collection("activities").add({
    type: "create_promotion",
    description: `Membuat promosi baru '${doc.name}'.`,
    timestamp: now,
    meta: { promotion_id: ref.id },
  });

  const snap = await ref.get();
  return NextResponse.json({ id: snap.id, ...snap.data() });
}
