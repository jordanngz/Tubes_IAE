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

function defaultStoreDoc(uid: string) {
  const now = new Date().toISOString();
  return {
    owner_uid: uid,
    store_profile: {
      id: null,
      owner_id: uid,
      name: "Nama Toko Placeholder",
      slug: "nama-toko-placeholder",
      description: "Deskripsi singkat mengenai toko makanan kaleng Anda.",
      logo: "/images/store/logo-placeholder.png",
      banner: "/images/store/banner-placeholder.jpg",
      status: "pending",
      verified_at: null,
      rating_avg: 0.0,
      rating_count: 0,
      policies: {
        return_policy: "Belum diatur",
        shipping_policy: "Belum diatur",
        privacy_policy: "Belum diatur",
      },
      contact_email: "email@tokoanda.com",
      contact_phone: "+62-812-0000-0000",
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    store_address: {
      id: null,
      label: "Alamat Utama",
      recipient_name: "Nama Pemilik Toko",
      phone: "+62-812-0000-0000",
      address_line1: "Jalan Contoh No.123",
      address_line2: "Kecamatan Placeholder",
      city: "Kota Placeholder",
      state: "Provinsi Placeholder",
      postal_code: "12345",
      country: "ID",
      latitude: -6.2,
      longitude: 106.8166667,
      is_default: true,
    },
    store_operational_settings: {
      open_status: "open",
      open_hours: {
        monday: "08:00 - 20:00",
        tuesday: "08:00 - 20:00",
        wednesday: "08:00 - 20:00",
        thursday: "08:00 - 20:00",
        friday: "08:00 - 20:00",
        saturday: "09:00 - 18:00",
        sunday: "closed",
      },
      delivery_options: [
        { carrier_name: "JNE", service_code: "REG", estimated_days: "2-3", active: true },
        { carrier_name: "POS Indonesia", service_code: "Kilat", estimated_days: "3-5", active: false },
      ],
    },
    store_verification: {
      application_id: null,
      status: "submitted",
      proposed_name: "Nama Toko Placeholder",
      description: "Menjual berbagai makanan kaleng berkualitas.",
      documents: [
        { type: "KTP", file_url: "/uploads/documents/ktp-placeholder.jpg" },
        { type: "NPWP", file_url: "/uploads/documents/npwp-placeholder.jpg" },
      ],
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null,
    },
    store_policy_templates: [
      { type: "return_policy", title: "Kebijakan Pengembalian Barang", content: "Barang dapat dikembalikan dalam waktu 7 hari setelah diterima." },
      { type: "shipping_policy", title: "Kebijakan Pengiriman", content: "Pesanan diproses dalam waktu 1x24 jam dan dikirim melalui kurir pilihan Anda." },
      { type: "privacy_policy", title: "Kebijakan Privasi", content: "Kami menjaga kerahasiaan data pembeli sesuai dengan peraturan yang berlaku." },
    ],
  };
}

export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docRef = adminDb.collection("stores").doc(uid);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "StoreNotFound" }, { status: 404 });
  }

  return NextResponse.json(snap.data());
}

export async function PATCH(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json().catch(() => ({}));
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const docRef = adminDb.collection("stores").doc(uid);
  const update = { ...payload, "store_profile.updated_at": new Date().toISOString() } as Record<string, any>;

  // upsert store doc
  await docRef.set(update, { merge: true });

  // ensure seller_meta.has_store = true when a store is created/updated
  await adminDb
    .collection("seller_meta")
    .doc(uid)
    .set({ has_store: true, updated_at: new Date().toISOString() }, { merge: true });

  // return the latest snapshot
  const snap = await docRef.get();
  return NextResponse.json(snap.data());
}
