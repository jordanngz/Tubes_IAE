import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

function csvEscape(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const needsQuotes = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function csvRow(values: any[]): string {
  return values.map(csvEscape).join(",") + "\n";
}

export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") as PeriodKey) || "last_30_days";
  const startParam = searchParams.get("start") || undefined;
  const endParam = searchParams.get("end") || undefined;
  const format = (searchParams.get("format") || "csv").toLowerCase();
  const { start, end } = getPeriodRange(period, startParam, endParam);

  const supportXlsx = format === "xlsx";
  const supportCsv = format === "csv";
  const supportPdf = format === "pdf";

  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });
  const store = storeSnap.data() as any;

  // Fetch datasets similar to analytics route
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

  // Filter by period
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

  // Sales trend
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

  // Top products
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

  // Category performance
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

  // Payment summary
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

  // Shipping summary
  const total_shipments = shipmentsInPeriod.length;
  const delivered = shipmentsInPeriod.filter((s) => String(s.status || "") === "delivered").length;
  const in_transit = shipmentsInPeriod.filter((s) => ["in_transit", "shipped", "processing"].includes(String(s.status || ""))).length;
  const returned = shipmentsInPeriod.filter((s) => String(s.status || "") === "returned").length;
  const times: number[] = [];
  for (const s of shipmentsInPeriod) {
    if (s.delivered_at && s.created_at) {
      const ms = Date.parse(s.delivered_at) - Date.parse(s.created_at);
      if (ms > 0) times.push(ms);
    }
  }
  const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const average_delivery_time_days = avgMs ? Number((avgMs / (1000 * 60 * 60 * 24)).toFixed(1)) : 0;
  const carrierAgg: Record<string, { carrier_name: string; shipment_count: number; on_time_rate: number }> = {};
  for (const s of shipmentsInPeriod) {
    const carrier = String(s.carrier || s.shipping_carrier || "Lainnya");
    if (!carrierAgg[carrier]) carrierAgg[carrier] = { carrier_name: carrier, shipment_count: 0, on_time_rate: 0 };
    carrierAgg[carrier].shipment_count += 1;
  }
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

  // Customer feedback
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

  // Financial report
  const gross_revenue = ordersInPeriod
    .filter((o) => ["paid", "settlement", "success"].includes(String(o.payment_status || "")) || ["completed", "delivered"].includes(String(o.status || "")))
    .reduce((acc, o) => acc + Number(o.total || 0), 0);
  const total_discounts = redemptionsInPeriod.reduce((acc, r) => acc + Number(r.discount_amount || 0), 0);
  const total_fees = 0;
  const net_revenue = gross_revenue - total_discounts - total_fees;
  const estimated_payout = net_revenue;
  const last_payout_date = end;

  // store_info
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    period: { start, end },
    generated_at: new Date().toISOString(),
  };

  if (supportCsv) {
    // Build CSV content with sections
    let csv = "";
    csv += csvRow(["Store", store_info.store_name]);
    csv += csvRow(["Period Start", store_info.period.start]);
    csv += csvRow(["Period End", store_info.period.end]);
    csv += csvRow(["Generated At", store_info.generated_at]);
    csv += "\n";

    csv += csvRow(["Sales Overview"]);
    csv += csvRow(["total_orders", "completed_orders", "canceled_orders", "returned_orders", "total_revenue", "average_order_value", "total_products_sold", "total_buyers"]);
    csv += csvRow([
      total_orders,
      completed_orders,
      canceled_orders,
      returned_orders,
      total_revenue,
      Number(average_order_value.toFixed(2)),
      total_products_sold,
      total_buyers,
    ]);
    csv += "\n";

    csv += csvRow(["Sales Trend"]);
    csv += csvRow(["date", "order_count", "revenue"]);
    for (const t of sales_trend) {
      csv += csvRow([t.date, t.order_count, t.revenue]);
    }
    csv += "\n";

    csv += csvRow(["Top Products"]);
    csv += csvRow(["product_id", "product_name", "total_sold", "revenue", "average_rating", "stock_remaining"]);
    for (const p of top_products) {
      csv += csvRow([p.product_id, p.product_name, p.total_sold, p.revenue, p.average_rating, p.stock_remaining]);
    }
    csv += "\n";

    csv += csvRow(["Category Performance"]);
    csv += csvRow(["category_id", "category_name", "total_products", "total_sold", "revenue"]);
    for (const c of category_performance) {
      csv += csvRow([c.category_id, c.category_name, c.total_products, c.total_sold, c.revenue]);
    }
    csv += "\n";

    csv += csvRow(["Payment Summary"]);
    csv += csvRow(["total_transactions", "successful_payments", "failed_payments"]);
    csv += csvRow([total_transactions, successful_payments, failed_payments]);
    csv += csvRow(["Payment Methods"]);
    csv += csvRow(["method", "transaction_count", "total_amount"]);
    for (const m of payment_methods) {
      csv += csvRow([m.method, m.transaction_count, m.total_amount]);
    }
    csv += "\n";

    csv += csvRow(["Shipping Summary"]);
    csv += csvRow(["total_shipments", "delivered", "in_transit", "returned", "average_delivery_time_days"]);
    csv += csvRow([total_shipments, delivered, in_transit, returned, average_delivery_time_days]);
    csv += csvRow(["Top Carriers"]);
    csv += csvRow(["carrier_name", "shipment_count", "on_time_rate"]);
    for (const c of top_carriers) {
      csv += csvRow([c.carrier_name, c.shipment_count, c.on_time_rate]);
    }
    csv += "\n";

    csv += csvRow(["Customer Feedback"]);
    csv += csvRow(["total_reviews", "average_rating", "positive_reviews", "neutral_reviews", "negative_reviews"]);
    csv += csvRow([total_reviews, Number(avgRating.toFixed(1)), positive_reviews, neutral_reviews, negative_reviews]);
    csv += csvRow(["Recent Reviews"]);
    csv += csvRow(["review_id", "product_name", "rating", "title", "body", "created_at"]);
    for (const r of recent_reviews) {
      csv += csvRow([r.review_id, r.product_name, r.rating, r.title, r.body, r.created_at]);
    }
    csv += "\n";

    csv += csvRow(["Financial Report"]);
    csv += csvRow(["gross_revenue", "total_discounts", "total_fees", "net_revenue", "estimated_payout", "last_payout_date"]);
    csv += csvRow([gross_revenue, total_discounts, 0, net_revenue, estimated_payout, last_payout_date]);

    const fileName = `analytics_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (supportXlsx) {
    const wb = XLSX.utils.book_new();
    const metaAoA = [
      ["Store", store_info.store_name],
      ["Period Start", store_info.period.start],
      ["Period End", store_info.period.end],
      ["Generated At", store_info.generated_at],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metaAoA), "Meta");

    const overviewAoA = [
      ["total_orders", "completed_orders", "canceled_orders", "returned_orders", "total_revenue", "average_order_value", "total_products_sold", "total_buyers"],
      [
        total_orders,
        completed_orders,
        canceled_orders,
        returned_orders,
        total_revenue,
        Number(average_order_value.toFixed(2)),
        total_products_sold,
        total_buyers,
      ],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewAoA), "Sales_Overview");

    const trendAoA = [["date", "order_count", "revenue"], ...sales_trend.map((t) => [t.date, t.order_count, t.revenue])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(trendAoA), "Sales_Trend");

    const topProductsAoA = [["product_id", "product_name", "total_sold", "revenue", "average_rating", "stock_remaining"], ...top_products.map((p) => [p.product_id, p.product_name, p.total_sold, p.revenue, p.average_rating, p.stock_remaining])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topProductsAoA), "Top_Products");

    const categoryAoA = [["category_id", "category_name", "total_products", "total_sold", "revenue"], ...category_performance.map((c) => [c.category_id, c.category_name, c.total_products, c.total_sold, c.revenue])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(categoryAoA), "Categories");

    const paymentAoA = [
      ["total_transactions", "successful_payments", "failed_payments"],
      [total_transactions, successful_payments, failed_payments],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(paymentAoA), "Payment_Summary");
    const paymentMethodsAoA = [["method", "transaction_count", "total_amount"], ...payment_methods.map((m) => [m.method, m.transaction_count, m.total_amount])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(paymentMethodsAoA), "Payment_Methods");

    const shippingAoA = [["total_shipments", "delivered", "in_transit", "returned", "average_delivery_time_days"], [total_shipments, delivered, in_transit, returned, average_delivery_time_days]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(shippingAoA), "Shipping_Summary");
    const carriersAoA = [["carrier_name", "shipment_count", "on_time_rate"], ...top_carriers.map((c) => [c.carrier_name, c.shipment_count, c.on_time_rate])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(carriersAoA), "Top_Carriers");

    const feedbackAoA = [["total_reviews", "average_rating", "positive", "neutral", "negative"], [total_reviews, Number(avgRating.toFixed(1)), positive_reviews, neutral_reviews, negative_reviews]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(feedbackAoA), "Feedback_Summary");
    const recentAoA = [["review_id", "product_name", "rating", "title", "body", "created_at"], ...recent_reviews.map((r) => [r.review_id, r.product_name, r.rating, r.title, r.body, r.created_at])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(recentAoA), "Recent_Reviews");

    const financialAoA = [["gross_revenue", "total_discounts", "total_fees", "net_revenue", "estimated_payout", "last_payout_date"], [gross_revenue, total_discounts, 0, net_revenue, estimated_payout, last_payout_date]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(financialAoA), "Financial_Report");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fileName = `analytics_report_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (supportPdf) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 50;
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addTitle = (text: string) => {
      const size = 18;
      page.drawText(text, { x: margin, y: y - size, size, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      y -= size + 12;
    };
    const addSubtitle = (text: string) => {
      const size = 12;
      page.drawText(text, { x: margin, y: y - size, size, font, color: rgb(0.3, 0.3, 0.3) });
      y -= size + 8;
    };
    const addLine = (label: string, value: string | number) => {
      const size = 11;
      const line = `${label}: ${String(value)}`;
      // Simple wrap if exceeding width
      const maxChars = 100;
      const chunks = line.match(new RegExp(`.{1,${maxChars}}`, "g")) || [line];
      for (const chunk of chunks) {
        if (y < margin + 60) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(chunk, { x: margin, y: y - size, size, font, color: rgb(0, 0, 0) });
        y -= size + 4;
      }
    };
    const addSpacer = (h = 10) => {
      y -= h;
    };
    const addSection = (title: string) => {
      addSpacer(6);
      addTitle(title);
    };

    // Header
    addTitle("Laporan Analitik Toko");
    addSubtitle(`Store: ${store_info.store_name || "-"}`);
    addLine("Period Start", store_info.period.start);
    addLine("Period End", store_info.period.end);
    addLine("Generated At", store_info.generated_at);

    // Sales Overview
    addSection("Ringkasan Penjualan");
    addLine("Total Orders", total_orders);
    addLine("Completed", completed_orders);
    addLine("Canceled", canceled_orders);
    addLine("Returned", returned_orders);
    addLine("Total Revenue", total_revenue);
    addLine("Average Order Value", Number(average_order_value.toFixed(2)));
    addLine("Products Sold", total_products_sold);
    addLine("Unique Buyers", total_buyers);

    // Payment Summary
    addSection("Ringkasan Pembayaran");
    addLine("Total Transactions", total_transactions);
    addLine("Successful", successful_payments);
    addLine("Failed", failed_payments);
    addSubtitle("Metode Pembayaran:");
    for (const m of payment_methods.slice(0, 10)) {
      addLine(`- ${m.method}`, `${m.transaction_count} trx, amount=${m.total_amount}`);
    }

    // Shipping Summary
    addSection("Ringkasan Pengiriman");
    addLine("Total Shipments", total_shipments);
    addLine("Delivered", delivered);
    addLine("In Transit", in_transit);
    addLine("Returned", returned);
    addLine("Avg Delivery (days)", average_delivery_time_days);
    addSubtitle("Kurir Teratas:");
    for (const c of top_carriers.slice(0, 10)) {
      addLine(`- ${c.carrier_name}`, `${c.shipment_count} pengiriman, on-time ${c.on_time_rate}%`);
    }

    // Financial
    addSection("Laporan Keuangan");
    addLine("Gross Revenue", gross_revenue);
    addLine("Discounts", total_discounts);
    addLine("Fees", 0);
    addLine("Net Revenue", net_revenue);
    addLine("Estimated Payout", estimated_payout);
    addLine("Last Payout Date", last_payout_date);

    // Feedback
    addSection("Feedback Pelanggan");
    addLine("Total Reviews", total_reviews);
    addLine("Average Rating", Number(avgRating.toFixed(1)));
    addLine("Positive", positive_reviews);
    addLine("Neutral", neutral_reviews);
    addLine("Negative", negative_reviews);

    const pdfBytes = await pdfDoc.save();
    const fileName = `analytics_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes) as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${fileName}`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ error: "UnsupportedFormat", message: "Supported formats: csv, xlsx, pdf" }, { status: 400 });
}
