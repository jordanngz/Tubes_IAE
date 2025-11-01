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

// GET /api/seller/activities - Fetch activity log with summary
export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // all, login, create_product, etc.
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const storeRef = adminDb.collection("stores").doc(uid);
    const storeDoc = await storeRef.get();

    if (!storeDoc.exists) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Build query
    let activityQuery = storeRef
      .collection("activities")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .offset(offset);

    if (type !== "all") {
      activityQuery = activityQuery.where("type", "==", type) as any;
    }

    const activitySnapshot = await activityQuery.get();
    const activity_log = activitySnapshot.docs.map((doc) => ({
      activity_id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null,
    }));

    // Get total activities count
    const totalSnapshot = await storeRef.collection("activities").count().get();
    const total_activities = totalSnapshot.data().count;

    // Get today's activities count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySnapshot = await storeRef
      .collection("activities")
      .where("timestamp", ">=", todayStart)
      .count()
      .get();
    const activities_today = todaySnapshot.data().count;

    // Get most common action (from recent 100 activities)
    const recentSnapshot = await storeRef
      .collection("activities")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const actionCounts: Record<string, number> = {};
    recentSnapshot.docs.forEach((doc) => {
      const type = doc.data().type;
      actionCounts[type] = (actionCounts[type] || 0) + 1;
    });

    const most_common_action =
      Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

    // Get recent login
    const loginSnapshot = await storeRef
      .collection("activities")
      .where("type", "==", "login")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    const recent_login_at = loginSnapshot.docs[0]
      ? loginSnapshot.docs[0].data().timestamp?.toDate?.()?.toISOString()
      : new Date().toISOString();

    // Active sessions (simplified - count logins in last hour)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeSnapshot = await storeRef
      .collection("activities")
      .where("type", "==", "login")
      .where("timestamp", ">=", hourAgo)
      .count()
      .get();
    const active_sessions = Math.min(activeSnapshot.data().count, 5); // Cap at 5

    return NextResponse.json({
      activity_log,
      activity_summary: {
        total_activities,
        activities_today,
        most_common_action,
        recent_login_at,
        active_sessions,
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
