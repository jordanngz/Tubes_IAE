import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const convId = params.id;
    const convRef = adminDb.doc(`stores/${uid}/conversations/${convId}`);
    const convSnap = await convRef.get();
    if (!convSnap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const messagesRef = convRef.collection("messages").orderBy("sent_at", "asc");
    const msgSnap = await messagesRef.limit(limit).get();
    const messages = msgSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ conversation: { id: convSnap.id, ...convSnap.data() }, messages });
  } catch (err: any) {
    console.error("/chat/conversations/[id] GET error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const convId = params.id;
    const convRef = adminDb.doc(`stores/${uid}/conversations/${convId}`);
    const body = await request.json();
    const action = body?.action;

    if (action === "mark_read") {
      // Mark all buyer messages as read and reset unread_count
      const batch = adminDb.batch();
      const msgsSnap = await convRef
        .collection("messages")
        .where("sender_role", "==", "buyer")
        .where("is_read", "==", false)
        .get();
      msgsSnap.forEach((d) => batch.update(d.ref, { is_read: true }));
      batch.update(convRef, { unread_count: 0, updated_at: new Date() });
      await batch.commit();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_flag") {
      const snap = await convRef.get();
      if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const is_flagged = Boolean((snap.data() as any).is_flagged);
      await convRef.update({ is_flagged: !is_flagged, updated_at: new Date() });
      return NextResponse.json({ ok: true, is_flagged: !is_flagged });
    }

    if (action === "toggle_archive") {
      const snap = await convRef.get();
      if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const is_archived = Boolean((snap.data() as any).is_archived);
      await convRef.update({ is_archived: !is_archived, updated_at: new Date() });
      return NextResponse.json({ ok: true, is_archived: !is_archived });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("/chat/conversations/[id] PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
