import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function getUidFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// PATCH /api/seller/notifications/settings - Update notification preferences
export async function PATCH(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      email_notifications,
      push_notifications,
      in_app_notifications,
      preferences,
    } = body;

    const storeRef = adminDb.collection("stores").doc(uid);
    const storeDoc = await storeRef.get();

    if (!storeDoc.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const now = new Date();
    const settingsRef = storeRef.collection("settings").doc("notifications");

    const settingsData = {
      email_notifications: email_notifications ?? true,
      push_notifications: push_notifications ?? true,
      in_app_notifications: in_app_notifications ?? true,
      preferences: preferences ?? {
        order_updates: true,
        product_reviews: true,
        system_alerts: true,
        promotions: false,
      },
      last_updated: now,
    };

    await settingsRef.set(settingsData, { merge: true });

    // Log activity
    await storeRef.collection("activities").add({
      type: "update_notification_settings",
      description: "Mengupdate pengaturan notifikasi",
      timestamp: now,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      success: true,
      notification_settings: {
        ...settingsData,
        last_updated: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
