import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const getUserInfo = async (uid: string) => {
  const userDoc = await adminDb.doc(`stores/${uid}/user_info/main`).get();
  const info = userDoc.exists ? userDoc.data() : {};
  return info || {};
};

const getProfile = async (uid: string) => {
  const doc = await adminDb.doc(`stores/${uid}/profile/main`).get();
  return doc.exists ? doc.data() : {};
};

const getStoreAssociation = async (uid: string) => {
  const doc = await adminDb.doc(`stores/${uid}/store/main`).get();
  return doc.exists ? doc.data() : {};
};

const getAccountSettings = async (uid: string) => {
  const doc = await adminDb.doc(`stores/${uid}/settings/account`).get();
  return doc.exists ? doc.data() : {};
};

const getSecurity = async (uid: string) => {
  const secMainDocPath = `stores/${uid}/security/main`;
  const devSnap = await adminDb
    .collection(`${secMainDocPath}/login_devices`)
    .orderBy("last_login", "desc")
    .get();
  const login_devices = devSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const histSnap = await adminDb
    .collection(`${secMainDocPath}/login_history`)
    .orderBy("timestamp", "desc")
    .limit(50)
    .get();
  const login_history = histSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const secDoc = await adminDb.doc(secMainDocPath).get();
  const sec = secDoc.exists ? secDoc.data() : {};
  return { ...sec, login_devices, login_history };
};

const getAddresses = async (uid: string) => {
  const snap = await adminDb.collection(`stores/${uid}/addresses`).orderBy("created_at", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const getActivities = async (uid: string) => {
  const snap = await adminDb.collection(`stores/${uid}/activities`).orderBy("timestamp", "desc").limit(50).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (e: any) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const uid = decoded.uid;

    const [user_info, profile, store_association, account_settings, security, address_book, activity_log] = await Promise.all([
      getUserInfo(uid),
      getProfile(uid),
      getStoreAssociation(uid),
      getAccountSettings(uid),
      getSecurity(uid),
      getAddresses(uid),
      getActivities(uid),
    ]);

    return NextResponse.json({ user_info, profile, store_association, account_settings, security_settings: security, address_book, activity_log });
  } catch (err: any) {
    console.error("/profile GET error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (e: any) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const uid = decoded.uid;
    const body = await request.json();

    const profileUpdates: any = {};
    if (body.full_name !== undefined) profileUpdates.full_name = body.full_name;
    if (body.photo_url !== undefined) profileUpdates.photo_url = body.photo_url;
    if (body.gender !== undefined) profileUpdates.gender = body.gender;
    if (body.phone_number !== undefined) profileUpdates.phone_number = body.phone_number;
    if (body.bio !== undefined) profileUpdates.bio = body.bio;
    if (Object.keys(profileUpdates).length) {
      profileUpdates.updated_at = new Date();
      await adminDb.doc(`stores/${uid}/profile/main`).set(profileUpdates, { merge: true });
    }

    if (body.username !== undefined) {
      await adminDb.doc(`stores/${uid}/user_info/main`).set({ username: body.username, updated_at: new Date() }, { merge: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/profile PATCH error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
