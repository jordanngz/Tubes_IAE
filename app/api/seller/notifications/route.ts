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

// GET /api/seller/notifications - Fetch notifications with filters
export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all"; // all, read, unread
    const priority = searchParams.get("priority") || "all"; // all, high, medium, low
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const storeRef = adminDb.collection("stores").doc(uid);
    const storeDoc = await storeRef.get();

    if (!storeDoc.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Build query
    let notifQuery = storeRef
      .collection("notifications")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    if (status !== "all") {
      notifQuery = notifQuery.where("status", "==", status) as any;
    }
    if (priority !== "all") {
      notifQuery = notifQuery.where("priority", "==", priority) as any;
    }

    const notifSnapshot = await notifQuery.get();
    const notifications = notifSnapshot.docs.map((doc) => ({
      notification_id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || null,
      read_at: doc.data().read_at?.toDate?.()?.toISOString() || null,
    }));

    // Count unread
    const unreadSnapshot = await storeRef
      .collection("notifications")
      .where("status", "==", "unread")
      .count()
      .get();
    const unread_count = unreadSnapshot.data().count;

    // Get total notifications
    const totalSnapshot = await storeRef.collection("notifications").count().get();
    const total_count = totalSnapshot.data().count;

    // Fetch system alerts
    const alertsSnapshot = await storeRef
      .collection("system_alerts")
      .orderBy("created_at", "desc")
      .limit(10)
      .get();
    const system_alerts = alertsSnapshot.docs.map((doc) => ({
      alert_id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || null,
    }));

    // Fetch notification settings
    const settingsDoc = await storeRef.collection("settings").doc("notifications").get();
    const notification_settings = settingsDoc.exists
      ? {
          ...settingsDoc.data(),
          last_updated: settingsDoc.data()?.last_updated?.toDate?.()?.toISOString() || null,
        }
      : {
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true,
          preferences: {
            order_updates: true,
            product_reviews: true,
            system_alerts: true,
            promotions: false,
          },
          last_updated: new Date().toISOString(),
        };

    return NextResponse.json({
      store_info: {
        store_id: uid,
        store_name: storeDoc.data()?.store_name || "",
        unread_notifications: unread_count,
        total_notifications: total_count,
        recent_activity_count: 0,
        last_checked_at: new Date().toISOString(),
      },
      notifications,
      system_alerts,
      notification_settings,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/seller/notifications - Mark all as read
export async function PATCH(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action !== "mark_all_read") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const storeRef = adminDb.collection("stores").doc(uid);
    const unreadSnapshot = await storeRef
      .collection("notifications")
      .where("status", "==", "unread")
      .get();

    const batch = adminDb.batch();
    const now = new Date();

    unreadSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "read",
        read_at: now,
      });
    });

    await batch.commit();

    // Log activity
    await storeRef.collection("activities").add({
      type: "mark_all_notifications_read",
      description: `Menandai semua notifikasi sebagai dibaca (${unreadSnapshot.size} notifikasi)`,
      timestamp: now,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      success: true,
      marked_count: unreadSnapshot.size,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
