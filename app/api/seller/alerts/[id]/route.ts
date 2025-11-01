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

// PATCH /api/seller/alerts/[id] - Dismiss system alert
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
    const { action } = body; // "dismiss"

    if (action !== "dismiss") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const storeRef = adminDb.collection("stores").doc(uid);
    const alertRef = storeRef.collection("system_alerts").doc(id);
    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await alertRef.delete();

    // Log activity
    const now = new Date();
    await storeRef.collection("activities").add({
      type: "dismiss_alert",
      description: `Menutup alert sistem "${alertDoc.data()?.title}"`,
      related_alert_id: id,
      timestamp: now,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message: "Alert dismissed",
    });
  } catch (error) {
    console.error("Error dismissing alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
