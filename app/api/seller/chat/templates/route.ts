import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const snap = await adminDb.collection(`stores/${uid}/chat_templates`).orderBy("title").get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ templates: items });
  } catch (err: any) {
    console.error("/chat/templates GET error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const body = await request.json();
    const { title, content, is_active = true } = body || {};
    if (!title || !content) return NextResponse.json({ error: "Missing title/content" }, { status: 400 });

    const now = new Date();
    const ref = await adminDb.collection(`stores/${uid}/chat_templates`).add({
      title,
      content,
      is_active: Boolean(is_active),
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err: any) {
    console.error("/chat/templates POST error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
