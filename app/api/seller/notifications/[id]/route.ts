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

// PATCH /api/seller/notifications/[id] - Mark as read or delete
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body; // "mark_read" or "delete"

    const storeRef = adminDb.collection("stores").doc(uid);
    const notifRef = storeRef.collection("notifications").doc(id);
    const notifDoc = await notifRef.get();

    if (!notifDoc.exists) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const now = new Date();

    if (action === "mark_read") {
      await notifRef.update({
        status: "read",
        read_at: now,
      });

      // Log activity
      await storeRef.collection("activities").add({
        type: "mark_notification_read",
        description: `Menandai notifikasi "${notifDoc.data()?.title}" sebagai dibaca`,
        related_notification_id: id,
        timestamp: now,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else if (action === "delete") {
      await notifRef.delete();

      // Log activity
      await storeRef.collection("activities").add({
        type: "delete_notification",
        description: `Menghapus notifikasi "${notifDoc.data()?.title}"`,
        related_notification_id: id,
        timestamp: now,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: "Notification deleted",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
