import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all|unread|flagged|archived
    const q = (searchParams.get("q") || "").toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const baseRef = adminDb.collection(`stores/${uid}/conversations`);
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = baseRef;

    if (filter === "unread") {
      // Avoid inequality+orderBy constraint by querying without order then sorting in memory
      query = query.where("unread_count", ">", 0);
    } else if (filter === "flagged") {
      query = query.where("is_flagged", "==", true);
    } else if (filter === "archived") {
      query = query.where("is_archived", "==", true);
    } else {
      // Default "all" uses orderBy on last_message_time
      query = query.orderBy("last_message_time", "desc");
    }

    const snap = await query.limit(limit).get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
    // Client-side sort by last_message_time desc when filtered
    if (filter !== "all") {
      items.sort((a: any, b: any) => {
        const at = (a.last_message_time?.toDate ? a.last_message_time.toDate() : a.last_message_time) || 0;
        const bt = (b.last_message_time?.toDate ? b.last_message_time.toDate() : b.last_message_time) || 0;
        return (bt as any) - (at as any);
      });
    }
    if (q) {
      items = items.filter((it: any) => (it.buyer_name || "").toLowerCase().includes(q));
    }

    return NextResponse.json({ conversations: items });
  } catch (err: any) {
    console.error("/chat/conversations GET error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Create a new conversation (optional, used when first contacting a buyer)
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const body = await request.json();
    const { buyer_id, buyer_name, buyer_avatar, order_reference } = body || {};
    if (!buyer_id || !buyer_name) return NextResponse.json({ error: "Missing buyer info" }, { status: 400 });

    const docRef = await adminDb.collection(`stores/${uid}/conversations`).add({
      buyer_id,
      buyer_name,
      buyer_avatar: buyer_avatar || null,
      order_reference: order_reference || null,
      last_message_preview: "",
      last_message_time: null,
      unread_count: 0,
      is_archived: false,
      is_flagged: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err: any) {
    console.error("/chat/conversations POST error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
