import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const id = params.id;
    const body = await request.json();
    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
    updates.updated_at = new Date();
    await adminDb.doc(`stores/${uid}/chat_templates/${id}`).update(updates);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/chat/templates/[id] PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const id = params.id;
    await adminDb.doc(`stores/${uid}/chat_templates/${id}`).delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/chat/templates/[id] DELETE error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
