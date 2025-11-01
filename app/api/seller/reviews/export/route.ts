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
  if (!storeSnap.exists) return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });

  const reviewsSnap = await storeRef.collection("reviews").orderBy("created_at", "desc").get();
  const rows = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const headers = [
    "review_id",
    "created_at",
    "product_id",
    "product_name",
    "user_id",
    "user_name",
    "rating",
    "title",
    "body",
    "helpful_count",
    "reported",
    "is_visible",
    "reply_message",
    "replied_at",
  ];

  const escape = (val: any) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes("\r") || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const csv = [headers.join(",")]
    .concat(
      rows.map((r: any) =>
        [
          r.id,
          r.created_at,
          r.product_id,
          r.product_name,
          r.user_id,
          r.user_name,
          r.rating,
          r.title,
          r.body,
          r.helpful_count ?? 0,
          r.reported ? "true" : "false",
          r.is_visible ? "true" : "false",
          r?.reply?.message || "",
          r?.reply?.replied_at || "",
        ]
          .map(escape)
          .join(",")
      )
    )
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=reviews_${uid}.csv`,
    },
  });
}
