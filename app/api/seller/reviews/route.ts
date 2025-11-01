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

  // reviews collection under store
  const reviewsSnap = await storeRef.collection("reviews").orderBy("created_at", "desc").get();
  const product_reviews = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // compute summary stats
  const total_reviews = product_reviews.length;
  const ratingValues = [1, 2, 3, 4, 5];
  const rating_distribution: Record<string, number> = {
    "5_star": 0,
    "4_star": 0,
    "3_star": 0,
    "2_star": 0,
    "1_star": 0,
  };
  let ratingSum = 0;
  let total_replied_reviews = 0;
  let total_unreplied_reviews = 0;
  for (const r of product_reviews as any[]) {
    const rating = Number(r.rating || 0);
    if (ratingValues.includes(rating)) {
      const key = `${rating}_star` as const;
      // @ts-ignore
      rating_distribution[key] = (rating_distribution[key] || 0) + 1;
      ratingSum += rating;
    }
    if (r.reply && r.reply.message) total_replied_reviews += 1;
    else total_unreplied_reviews += 1;
  }
  const average_rating = total_reviews > 0 ? Number((ratingSum / total_reviews).toFixed(2)) : 0;

  // most reviewed products
  const productMap: Record<string, { product_id: string; product_name: string; review_count: number; average_rating: number; rating_sum: number }> = {};
  for (const r of product_reviews as any[]) {
    const pid = r.product_id || "unknown";
    if (!productMap[pid]) {
      productMap[pid] = { product_id: pid, product_name: r.product_name || "", review_count: 0, average_rating: 0, rating_sum: 0 };
    }
    productMap[pid].review_count += 1;
    productMap[pid].rating_sum += Number(r.rating || 0);
  }
  const most_reviewed_products = Object.values(productMap)
    .map((p) => ({ ...p, average_rating: p.review_count > 0 ? Number((p.rating_sum / p.review_count).toFixed(1)) : 0 }))
    .sort((a, b) => b.review_count - a.review_count)
    .slice(0, 5)
    .map(({ rating_sum, ...rest }) => rest);

  const review_summary = {
    total_reviews,
    average_rating,
    rating_distribution,
    most_reviewed_products,
  };

  const store = storeSnap.data() as any;
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    total_reviews,
    average_rating,
    total_replied_reviews,
    total_unreplied_reviews,
  };

  // activity log (review-related)
  const actsSnap = await storeRef.collection("activities").orderBy("timestamp", "desc").limit(15).get();
  const activity_log = actsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a: any) => [
      "reply_review",
      "edit_reply_review",
      "delete_reply_review",
      "hide_review",
      "mark_review_visible",
      "report_review",
      "unreport_review",
      "mark_helpful",
    ].includes(a.type));

  return NextResponse.json({ store_info, product_reviews, review_summary, activity_log });
}
