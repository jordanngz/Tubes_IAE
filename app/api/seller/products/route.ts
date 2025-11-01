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

  // Ensure store exists
  const storeRef = adminDb.collection("stores").doc(uid);
  const storeSnap = await storeRef.get();
  if (!storeSnap.exists) {
    return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });
  }

  // Query products under this store
  const productsRef = storeRef.collection("products");
  const productsSnap = await productsRef.get();
  const product_list = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Compute statistics
  const total_products = product_list.length;
  const active_products = product_list.filter((p: any) => p.is_active !== false).length;
  const inactive_products = total_products - active_products;
  const low_stock_products = product_list.filter((p: any) => typeof p.stock === "number" && p.stock > 0 && p.stock < 10).length;
  const out_of_stock_products = product_list.filter((p: any) => p.stock === 0).length;
  const total_reviews = product_list.reduce((acc: number, p: any) => acc + (p.rating_count || 0), 0);
  const avgDen = product_list.filter((p: any) => typeof p.rating_avg === "number").length || 1;
  const average_rating = product_list.reduce((acc: number, p: any) => acc + (p.rating_avg || 0), 0) / avgDen;

  // store_info
  const store = storeSnap.data() as any;
  const total_sold = product_list.reduce((acc: number, p: any) => acc + (p.sold_count || 0), 0);
  const store_info = {
    store_id: uid,
    store_name: store?.store_profile?.name || "",
    status: store?.store_profile?.status || "pending",
    total_products,
    total_sold,
    rating_avg: store?.store_profile?.rating_avg || 0,
  };

  // Optional: fetch last product-related activities
  const acts = await storeRef
    .collection("activities")
    .orderBy("timestamp", "desc")
    .limit(10)
    .get();
  const activity_log = acts.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a: any) => ["create_product", "update_stock", "update_product", "delete_product"].includes(a.type));

  return NextResponse.json({
    store_info,
    product_list,
    product_statistics: {
      total_products,
      active_products,
      inactive_products,
      low_stock_products,
      out_of_stock_products,
      total_reviews,
      average_rating: Number(average_rating.toFixed(2)),
    },
    product_reviews: [],
    activity_log,
  });
}

export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const product = {
    name: body.name,
    slug: body.slug,
    sku: body.sku || null,
    short_description: body.short_description || "",
    description: body.description || "",
    price: Number(body.price) || 0,
    compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null,
    stock: Number(body.stock) || 0,
    sold_count: 0,
    weight_grams: Number(body.weight_grams) || 0,
    attributes: body.attributes || {},
    is_active: body.is_active !== false,
    is_published: !!body.is_published,
    published_at: body.is_published ? now : null,
    rating_avg: 0,
    rating_count: 0,
    categories: body.categories || [],
    images: body.images || [],
    promotions: body.promotions || [],
    created_at: now,
    updated_at: now,
  };

  const storeRef = adminDb.collection("stores").doc(uid);
  const productsRef = storeRef.collection("products");
  const docRef = await productsRef.add(product);

  // log activity
  await storeRef.collection("activities").add({
    type: "create_product",
    description: `Menambahkan produk baru '${product.name}'.`,
    timestamp: new Date().toISOString(),
    meta: { product_id: docRef.id },
  });

  return NextResponse.json({ id: docRef.id, ...product }, { status: 201 });
}
