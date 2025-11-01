import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const { content, attachments } = await request.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }
    const convId = params.id;
    const convRef = adminDb.doc(`stores/${uid}/conversations/${convId}`);
    const convSnap = await convRef.get();
    if (!convSnap.exists) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const now = new Date();
    const message = {
      store_uid: uid,
      conversation_id: convId,
      sender_role: "seller",
      sender_uid: uid,
      content,
      attachments: Array.isArray(attachments) ? attachments : [],
      is_read: true, // seller messages considered read by seller
      sent_at: now,
    };

    const msgRef = await convRef.collection("messages").add(message);

    await convRef.update({
      last_message_preview: content.slice(0, 140),
      last_message_time: now,
      updated_at: now,
    });

    return NextResponse.json({ id: msgRef.id, ...message }, { status: 201 });
  } catch (err: any) {
    console.error("/chat/conversations/[id]/messages POST error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
