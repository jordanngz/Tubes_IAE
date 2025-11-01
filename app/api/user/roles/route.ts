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

  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const roles: string[] = (userSnap.exists && (userSnap.data()?.roles as string[])) || ["customer"];

  // include has_store hint
  const metaSnap = await adminDb.collection("seller_meta").doc(uid).get();
  const has_store = metaSnap.exists ? !!metaSnap.data()?.has_store : false;

  return NextResponse.json({ roles, has_store });
}
