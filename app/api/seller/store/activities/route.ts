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

  const colRef = adminDb.collection("stores").doc(uid).collection("activities");
  const snap = await colRef.orderBy("timestamp", "desc").limit(20).get();
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const colRef = adminDb.collection("stores").doc(uid).collection("activities");

  const payload = {
    type: body.type || "general",
    description: body.description || "",
    timestamp: new Date().toISOString(),
    meta: body.meta || null,
  };

  const doc = await colRef.add(payload);
  return NextResponse.json({ id: doc.id, ...payload }, { status: 201 });
}
