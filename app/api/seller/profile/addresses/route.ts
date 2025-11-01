import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const snap = await adminDb.collection(`stores/${uid}/addresses`).orderBy("created_at", "desc").get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ addresses: items });
  } catch (err: any) {
    console.error("/profile/addresses GET error", err);
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

    const address = {
      label: body.label || "",
      recipient_name: body.recipient_name || "",
      phone: body.phone || "",
      address_line1: body.address_line1 || "",
      address_line2: body.address_line2 || "",
      city: body.city || "",
      state: body.state || "",
      postal_code: body.postal_code || "",
      country: body.country || "ID",
      is_default: Boolean(body.is_default),
      created_at: new Date(),
    };

    const collection = adminDb.collection(`stores/${uid}/addresses`);
    if (address.is_default) {
      // unset previous defaults
      const snap = await collection.where("is_default", "==", true).get();
      const batch = adminDb.batch();
      snap.forEach((d) => batch.update(d.ref, { is_default: false }));
      await batch.commit();
    }
    const ref = await collection.add(address);
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err: any) {
    console.error("/profile/addresses POST error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
