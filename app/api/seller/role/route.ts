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

export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();

  const roles: string[] = (userSnap.exists && (userSnap.data()?.roles as string[])) || ["customer"];
  const hasSeller = roles.includes("seller");
  const newRoles = hasSeller ? roles : [...roles, "seller"];

  const sellerMetaRef = adminDb.collection("seller_meta").doc(uid);
  const sellerMetaSnap = await sellerMetaRef.get();

  const batch = adminDb.batch();
  batch.set(
    userRef,
    {
      uid,
      roles: newRoles,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );

  if (!sellerMetaSnap.exists) {
    batch.set(
      sellerMetaRef,
      {
        has_store: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  await batch.commit();

  return NextResponse.json({ ok: true, roles: newRoles });
}
