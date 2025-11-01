import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

type PeriodKey = "today" | "last_7_days" | "last_30_days" | "this_month" | "last_month" | "custom";

function getPeriodRange(period: PeriodKey, start?: string | null, end?: string | null) {
  const now = new Date();
  let from = new Date();
  let to = new Date();
  to.setHours(23, 59, 59, 999);

  switch (period) {
    case "today":
      from = new Date();
      from.setHours(0, 0, 0, 0);
      break;
    case "last_7_days": {
      from = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      from.setHours(0, 0, 0, 0);
      break;
    }
    case "last_30_days": {
      from = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      from.setHours(0, 0, 0, 0);
      break;
    }
    case "this_month": {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "last_month": {
      const m = now.getMonth() - 1;
      const y = m < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const monthIndex = (m + 12) % 12;
      from = new Date(y, monthIndex, 1);
      to = new Date(y, monthIndex + 1, 0);
      to.setHours(23, 59, 59, 999);
      break;
    }
    case "custom": {
      if (start) from = new Date(start);
      if (end) to = new Date(end);
      break;
    }
    default: {
      from = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      from.setHours(0, 0, 0, 0);
    }
  }
  return { start: from.toISOString(), end: to.toISOString() };
}

async function getUidFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

function dateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isWithin(iso: string | null | undefined, startIso: string, endIso: string) {
  if (!iso) return false;
  const t = Date.parse(iso);
  return t >= Date.parse(startIso) && t <= Date.parse(endIso);
}

export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") as PeriodKey) || "last_30_days";
  const startParam = searchParams.get("start") || undefined;
  const endParam = searchParams.get("end") || undefined;
  const { start, end } = getPeriodRange(period, startParam, endParam);

  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });
  const store = storeSnap.data() as any;

  // Fetch datasets
  const [ordersSnap, productsSnap, shipmentsSnap, reviewsSnap, redemptionsSnap] = await Promise.all([
    storeRef.collection("orders").get(),
    storeRef.collection("products").get(),
    storeRef.collection("shipments").get(),
    storeRef.collection("reviews").orderBy("created_at", "desc").get(),
    storeRef.collection("coupon_redemptions").get(),
  ]);

  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  const shipments = shipmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  const reviews = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  const redemptions = redemptionsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  // Filter by period (prefer order_date then created_at)
  const ordersInPeriod = orders.filter((o) => isWithin(o.order_date || o.created_at, start, end));
  const shipmentsInPeriod = shipments.filter((s) => isWithin(s.created_at, start, end));
  const reviewsInPeriod = reviews.filter((r) => isWithin(r.created_at, start, end));
  const redemptionsInPeriod = redemptions.filter((r) => isWithin(r.redeemed_at, start, end));

  // Sales overview
  const total_orders = ordersInPeriod.length;
  const countBy = (fn: (o: any) => boolean) => ordersInPeriod.filter(fn).length;
  const completed_orders = countBy((o) => ["completed", "delivered"].includes(String(o.status || "")));
  const canceled_orders = countBy((o) => String(o.status || "") === "canceled");
  const returned_orders = countBy((o) => String(o.status || "") === "returned");
  const total_revenue = ordersInPeriod.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;
  // products sold from order items if available, else fallback to sum of product.sold_count
  const itemsBasedSold = ordersInPeriod.some((o) => Array.isArray(o.items) && o.items.length > 0);
  const total_products_sold = itemsBasedSold
    ? ordersInPeriod.reduce((acc, o) => acc + (o.items || []).reduce((s: number, it: any) => s + Number(it.qty || it.quantity || 0), 0), 0)
    : products.reduce((acc, p) => acc + Number(p.sold_count || 0), 0);
  const uniqueBuyerIds = new Set<string>();
  for (const o of ordersInPeriod) {
    const cid = String(o.customer_id || o.user_id || "");
    if (cid) uniqueBuyerIds.add(cid);
  }
  const total_buyers = uniqueBuyerIds.size;

  const sales_overview = {
    total_orders,
    completed_orders,
    canceled_orders,
    returned_orders,
    total_revenue,
    average_order_value,
    total_products_sold,
    total_buyers,
  };

  // Sales trend by day
  const trendMap: Record<string, { order_count: number; revenue: number }> = {};
  for (const o of ordersInPeriod) {
    const dk = dateKey(o.order_date || o.created_at);
    if (!trendMap[dk]) trendMap[dk] = { order_count: 0, revenue: 0 };
    trendMap[dk].order_count += 1;
    trendMap[dk].revenue += Number(o.total || 0);
  }
  const sales_trend = Object.entries(trendMap)
    .map(([date, v]) => ({ date, order_count: v.order_count, revenue: v.revenue }))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  // Top products (from order items if present, otherwise from product docs)
  let top_products: any[] = [];
  if (itemsBasedSold) {
    const prodAgg: Record<string, { product_id: string; product_name: string; total_sold: number; revenue: number }> = {};
    for (const o of ordersInPeriod) {
      for (const it of o.items || []) {
        const pid = String(it.product_id || it.id || it.sku || it.name);
        if (!prodAgg[pid]) prodAgg[pid] = { product_id: pid, product_name: String(it.name || it.title || pid), total_sold: 0, revenue: 0 };
        const qty = Number(it.qty || it.quantity || 0);
        const price = Number(it.price || it.unit_price || 0);
        prodAgg[pid].total_sold += qty;
        prodAgg[pid].revenue += price * qty;
      }
    }
    top_products = Object.values(prodAgg)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10)
      .map((p) => ({ ...p, average_rating: 0, stock_remaining: null }));
    // enrich from product docs if available
    const prodMap = new Map(products.map((p) => [p.id, p]));
    top_products = top_products.map((p) => {
      const doc = prodMap.get(p.product_id);
      return { ...p, average_rating: doc?.rating_avg || 0, stock_remaining: doc?.stock ?? null };
    });
  } else {
    top_products = products
      .map((p) => ({
        product_id: p.id,
        product_name: p.name || p.title || p.sku || p.id,
        total_sold: Number(p.sold_count || 0),
        revenue: Number(p.price || 0) * Number(p.sold_count || 0),
        average_rating: Number(p.rating_avg || 0),
        stock_remaining: p.stock ?? null,
      }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10);
  }

  // Category performance from product docs
  const catAgg: Record<string, { category_id: string; category_name: string; total_products: number; total_sold: number; revenue: number }> = {};
  for (const p of products) {
    const cats: string[] = Array.isArray(p.categories) ? p.categories : [];
    const sold = Number(p.sold_count || 0);
    const rev = Number(p.price || 0) * sold;
    if (cats.length === 0) {
      const key = "Uncategorized";
      if (!catAgg[key]) catAgg[key] = { category_id: key, category_name: key, total_products: 0, total_sold: 0, revenue: 0 };
      catAgg[key].total_products += 1;
      catAgg[key].total_sold += sold;
      catAgg[key].revenue += rev;
    } else {
      for (const c of cats) {
        const key = String(c);
        if (!catAgg[key]) catAgg[key] = { category_id: key, category_name: key, total_products: 0, total_sold: 0, revenue: 0 };
        catAgg[key].total_products += 1;
        catAgg[key].total_sold += sold;
        catAgg[key].revenue += rev;
      }
    }
  }
  const category_performance = Object.values(catAgg).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Payment summary from orders
  const pmAgg: Record<string, { method: string; transaction_count: number; total_amount: number }> = {};
  let successful_payments = 0;
  let failed_payments = 0;
  for (const o of ordersInPeriod) {
    const method = String(o.payment_method || "Unknown");
    if (!pmAgg[method]) pmAgg[method] = { method, transaction_count: 0, total_amount: 0 };
    pmAgg[method].transaction_count += 1;
    pmAgg[method].total_amount += Number(o.total || 0);
    const ps = String(o.payment_status || "");
    if (["paid", "settlement", "success"].includes(ps)) successful_payments += 1;
    if (["failed", "canceled", "expired"].includes(ps)) failed_payments += 1;
  }
  const payment_methods = Object.values(pmAgg).sort((a, b) => b.total_amount - a.total_amount);
  const total_transactions = total_orders;
  const payment_summary = { total_transactions, successful_payments, failed_payments, payment_methods };

  // Shipping summary from shipments
  const shipping_summary = (() => {
    const total_shipments = shipmentsInPeriod.length;
    const delivered = shipmentsInPeriod.filter((s) => String(s.status || "") === "delivered").length;
    const in_transit = shipmentsInPeriod.filter((s) => ["in_transit", "shipped", "processing"].includes(String(s.status || ""))).length;
    const returned = shipmentsInPeriod.filter((s) => String(s.status || "") === "returned").length;
    // average delivery time
    const times: number[] = [];
    for (const s of shipmentsInPeriod) {
      if (s.delivered_at && s.created_at) {
        const ms = Date.parse(s.delivered_at) - Date.parse(s.created_at);
        if (ms > 0) times.push(ms);
      }
    }
    const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const average_delivery_time_days = avgMs ? Number((avgMs / (1000 * 60 * 60 * 24)).toFixed(1)) : 0;
    // carriers
    const carrierAgg: Record<string, { carrier_name: string; shipment_count: number; on_time_rate: number }> = {};
    for (const s of shipmentsInPeriod) {
      const carrier = String(s.carrier || s.shipping_carrier || "Lainnya");
      if (!carrierAgg[carrier]) carrierAgg[carrier] = { carrier_name: carrier, shipment_count: 0, on_time_rate: 0 };
      carrierAgg[carrier].shipment_count += 1;
    }
    // on_time_rate simple heuristic: delivered within 3 days
    for (const s of shipmentsInPeriod) {
      if (s.carrier && s.delivered_at && s.created_at) {
        const carrier = String(s.carrier || s.shipping_carrier);
        const within = Date.parse(s.delivered_at) - Date.parse(s.created_at) <= 3 * 24 * 60 * 60 * 1000;
        if (carrierAgg[carrier]) carrierAgg[carrier].on_time_rate += within ? 1 : 0;
      }
    }
    const carriers = Object.values(carrierAgg).map((c) => ({
      carrier_name: c.carrier_name,
      shipment_count: c.shipment_count,
      on_time_rate: c.shipment_count ? Number(((c.on_time_rate / c.shipment_count) * 100).toFixed(1)) : 0,
    }));
    const top_carriers = carriers.sort((a, b) => b.shipment_count - a.shipment_count).slice(0, 5);
    return { total_shipments, delivered, in_transit, returned, average_delivery_time_days, top_carriers };
  })();

  // Customer feedback from reviews
  const total_reviews = reviewsInPeriod.length;
  const avgRating = total_reviews ? reviewsInPeriod.reduce((acc, r) => acc + Number(r.rating || 0), 0) / total_reviews : 0;
  const positive_reviews = reviewsInPeriod.filter((r) => Number(r.rating || 0) >= 4).length;
  const neutral_reviews = reviewsInPeriod.filter((r) => Number(r.rating || 0) === 3).length;
  const negative_reviews = reviewsInPeriod.filter((r) => Number(r.rating || 0) <= 2).length;
  const recent_reviews = reviews
    .filter((r) => isWithin(r.created_at, start, end))
    .slice(0, 5)
    .map((r) => ({
      review_id: r.id,
      product_name: r.product_name || r.product_id || "",
      rating: Number(r.rating || 0),
      title: r.title || "",
      body: r.body || "",
      created_at: r.created_at,
    }));
  const customer_feedback = {
    total_reviews,
    average_rating: Number(avgRating.toFixed(1)),
    positive_reviews,
    neutral_reviews,
    negative_reviews,
    recent_reviews,
  };

  // Financial report
  const gross_revenue = ordersInPeriod
    .filter((o) => ["paid", "settlement", "success"].includes(String(o.payment_status || "")) || ["completed", "delivered"].includes(String(o.status || "")))
    .reduce((acc, o) => acc + Number(o.total || 0), 0);
  const total_discounts = redemptionsInPeriod.reduce((acc, r) => acc + Number(r.discount_amount || 0), 0);
  const total_fees = 0; // not tracked yet
  const net_revenue = gross_revenue - total_discounts - total_fees;
  const estimated_payout = net_revenue; // naive: 1:1
  const last_payout_date = end; // fallback to period end
  const financial_report = { gross_revenue, total_discounts, total_fees, net_revenue, estimated_payout, last_payout_date };

  // store_info
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    period: { start, end },
    generated_at: new Date().toISOString(),
  };

  // recent activities (generic)
  const actsSnap = await storeRef.collection("activities").orderBy("timestamp", "desc").limit(10).get();
  const activity_log = actsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({
    store_info,
    sales_overview,
    sales_trend,
    top_products,
    category_performance,
    payment_summary,
    shipping_summary,
    customer_feedback,
    financial_report,
    activity_log,
  });
}
