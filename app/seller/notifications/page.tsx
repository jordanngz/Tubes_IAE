"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"notifications" | "activity">("notifications");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationData, setNotificationData] = useState<any>({
    store_info: {
      store_id: null,
      store_name: "",
      unread_notifications: 0,
      total_notifications: 0,
      recent_activity_count: 0,
      last_checked_at: new Date().toISOString(),
    },
    notifications: [],
    system_alerts: [],
    notification_settings: {
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
    },
  });
  const [activityData, setActivityData] = useState<any>({
    activity_log: [],
    activity_summary: {
      total_activities: 0,
      activities_today: 0,
      most_common_action: "unknown",
      recent_login_at: new Date().toISOString(),
      active_sessions: 0,
    },
  });

  // Fetch notifications
  useEffect(() => {
    let mounted = true;
    async function loadNotifications() {
      if (!user) return;
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const params = new URLSearchParams({
          status: filterStatus,
          priority: filterPriority,
        });
        const res = await fetch(`/api/seller/notifications?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setNotificationData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadNotifications();
    return () => {
      mounted = false;
    };
  }, [user, filterStatus, filterPriority]);

  // Fetch activities
  useEffect(() => {
    let mounted = true;
    async function loadActivities() {
      if (!user || activeTab !== "activity") return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/seller/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setActivityData(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadActivities();
    return () => {
      mounted = false;
    };
  }, [user, activeTab]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/notifications`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        // Reload notifications
        const params = new URLSearchParams({
          status: filterStatus,
          priority: filterPriority,
        });
        const reloadRes = await fetch(`/api/seller/notifications?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (reloadRes.ok) {
          setNotificationData(await reloadRes.json());
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "mark_read" }),
      });
      if (res.ok) {
        // Update local state
        setNotificationData((prev: any) => ({
          ...prev,
          notifications: prev.notifications.map((n: any) =>
            n.notification_id === notificationId ? { ...n, status: "read", read_at: new Date().toISOString() } : n
          ),
          store_info: {
            ...prev.store_info,
            unread_notifications: Math.max(0, prev.store_info.unread_notifications - 1),
          },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete" }),
      });
      if (res.ok) {
        // Remove from local state
        setNotificationData((prev: any) => ({
          ...prev,
          notifications: prev.notifications.filter((n: any) => n.notification_id !== notificationId),
          store_info: {
            ...prev.store_info,
            total_notifications: Math.max(0, prev.store_info.total_notifications - 1),
          },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "dismiss" }),
      });
      if (res.ok) {
        // Remove from local state
        setNotificationData((prev: any) => ({
          ...prev,
          system_alerts: prev.system_alerts.filter((a: any) => a.alert_id !== alertId),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/notifications/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData.notification_settings),
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationData((prev: any) => ({
          ...prev,
          notification_settings: data.notification_settings,
        }));
        setShowSettings(false);
        alert("Pengaturan berhasil disimpan!");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan pengaturan");
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: "bg-red-100 text-red-700 border-red-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      low: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return styles[priority] || styles.medium;
  };

  const getAlertBadge = (level: string) => {
    const styles: Record<string, string> = {
      error: "bg-red-100 text-red-700 border-red-300",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
      info: "bg-blue-100 text-blue-700 border-blue-300",
      success: "bg-green-100 text-green-700 border-green-300",
    };
    return styles[level] || styles.info;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      create_product: "➕",
      update_order_status: "🔄",
      reply_review: "💬",
      login: "🔐",
      logout: "🚪",
      update_product: "✏️",
      delete_product: "🗑️",
    };
    return icons[type] || "📦";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🔔</span>
            <span>Notifikasi & Aktivitas</span>
          </h1>
          <p className="text-amber-800 mt-1">Pantau notifikasi dan aktivitas akun seller Anda</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
            <span>✅</span>
            <span>Tandai Semua Dibaca</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        {[
          {
            label: "Belum Dibaca",
            value: notificationData.store_info.unread_notifications,
            icon: "🔔",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Total Notifikasi",
            value: notificationData.store_info.total_notifications,
            icon: "📬",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Aktivitas Hari Ini",
            value: activityData.activity_summary.activities_today,
            icon: "⚡",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "Sesi Aktif",
            value: activityData.activity_summary.active_sessions,
            icon: "💻",
            color: "from-green-400 to-emerald-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-amber-700 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* System Alerts */}
      {notificationData.system_alerts.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {notificationData.system_alerts.map((alert: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 border-2 rounded-xl flex items-start gap-3 ${
                alert.level === "warning"
                  ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                  : alert.level === "error"
                  ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-300"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                  alert.level === "warning"
                    ? "bg-yellow-200"
                    : alert.level === "error"
                    ? "bg-red-200"
                    : "bg-blue-200"
                }`}
              >
                {alert.level === "warning" ? "⚠️" : alert.level === "error" ? "❌" : "ℹ️"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-amber-900">{alert.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getAlertBadge(alert.level)}`}>
                    {alert.level.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-amber-800">{alert.message}</p>
                <p className="text-xs text-amber-700 mt-1">{getTimeAgo(alert.created_at)}</p>
              </div>
              <button 
                onClick={() => handleDismissAlert(alert.alert_id)}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                ✖️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "notifications"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
              : "text-amber-900 hover:bg-orange-50"
          }`}
        >
          <span className="text-xl">🔔</span>
          <span>Notifikasi</span>
          {notificationData.store_info.unread_notifications > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "notifications" ? "bg-white text-orange-600" : "bg-red-500 text-white animate-pulse"
              }`}
            >
              {notificationData.store_info.unread_notifications}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "activity"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
              : "text-amber-900 hover:bg-orange-50"
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Log Aktivitas</span>
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filter by Status */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "Semua", icon: "📦" },
                  { id: "unread", label: "Belum Dibaca", icon: "🔔" },
                  { id: "read", label: "Dibaca", icon: "✅" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterStatus(filter.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      filterStatus === filter.id
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                        : "bg-orange-50 text-amber-900 hover:bg-orange-100"
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>

              {/* Filter by Priority */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "Semua Prioritas", icon: "📋" },
                  { id: "high", label: "Tinggi", icon: "🔴" },
                  { id: "medium", label: "Sedang", icon: "🟡" },
                  { id: "low", label: "Rendah", icon: "🔵" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterPriority(filter.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      filterPriority === filter.id
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                        : "bg-orange-50 text-amber-900 hover:bg-orange-100"
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notificationData.notifications.map((notification: any, idx: number) => (
              <div
                key={idx}
                className={`bg-white/80 backdrop-blur-xl border-2 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                  notification.status === "unread"
                    ? "border-orange-300 bg-gradient-to-r from-orange-50/50 to-amber-50/50"
                    : "border-orange-200"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                        notification.status === "unread"
                          ? "bg-gradient-to-br from-orange-400 to-red-500 animate-pulse"
                          : "bg-gradient-to-br from-gray-300 to-gray-400"
                      }`}
                    >
                      {notification.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-bold ${
                                notification.status === "unread" ? "text-amber-900" : "text-amber-800"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {notification.status === "unread" && (
                              <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                                BARU
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityBadge(
                                notification.priority
                              )}`}
                            >
                              {notification.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-amber-800 mt-1">{notification.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-amber-700">
                          <span className="flex items-center gap-1">
                            <span>🕐</span>
                            <span>{getTimeAgo(notification.created_at)}</span>
                          </span>
                          {notification.read_at && (
                            <span className="flex items-center gap-1">
                              <span>✅</span>
                              <span>
                                Dibaca {new Date(notification.read_at).toLocaleTimeString("id-ID", { timeStyle: "short" })}
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {notification.status === "unread" && (
                            <button 
                              onClick={() => handleMarkRead(notification.notification_id)}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors"
                            >
                              ✅ Tandai Dibaca
                            </button>
                          )}
                          <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors">
                            👁️ Detail
                          </button>
                          <button 
                            onClick={() => handleDeleteNotification(notification.notification_id)}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4 animate-fade-in">
          {/* Activity Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-2xl">
                  📊
                </div>
                <p className="text-3xl font-bold text-blue-900">{activityData.activity_summary.total_activities}</p>
                <p className="text-sm text-blue-700">Total Aktivitas</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl">
                  ⚡
                </div>
                <p className="text-3xl font-bold text-orange-900">{activityData.activity_summary.activities_today}</p>
                <p className="text-sm text-orange-700">Hari Ini</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl">
                  🔄
                </div>
                <p className="text-sm font-bold text-green-900">{activityData.activity_summary.most_common_action}</p>
                <p className="text-sm text-green-700">Aksi Terbanyak</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl">
                  🔐
                </div>
                <p className="text-sm font-bold text-purple-900">
                  {new Date(activityData.activity_summary.recent_login_at).toLocaleTimeString("id-ID", {
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-purple-700">Login Terakhir</p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-bold text-amber-900">Timeline Aktivitas</h2>
            </div>

            <div className="space-y-4">
              {activityData.activity_log.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4">
                  {/* Timeline Line */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    {idx < activityData.activity_log.length - 1 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-orange-300 to-amber-200 mt-2"></div>
                    )}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 pb-6">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all">
                      <p className="font-semibold text-amber-900 mb-2">{activity.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-700">
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span>
                            {new Date(activity.timestamp).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>💻</span>
                          <span className="truncate">{activity.ip_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🌐</span>
                          <span className="truncate">
                            {activity.user_agent.includes("Windows") ? "Windows" : "Other"} Browser
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>Pengaturan Notifikasi</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Notification Channels */}
              <div>
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <span>📬</span>
                  <span>Channel Notifikasi</span>
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      id: "email",
                      label: "Email Notifications",
                      icon: "📧",
                      enabled: notificationData.notification_settings.email_notifications,
                    },
                    {
                      id: "push",
                      label: "Push Notifications",
                      icon: "📱",
                      enabled: notificationData.notification_settings.push_notifications,
                    },
                    {
                      id: "in_app",
                      label: "In-App Notifications",
                      icon: "💬",
                      enabled: notificationData.notification_settings.in_app_notifications,
                    },
                  ].map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{channel.icon}</span>
                        <span className="font-semibold text-amber-900">{channel.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={channel.enabled} 
                          onChange={(e) => {
                            const key = channel.id === "email" ? "email_notifications" : 
                                       channel.id === "push" ? "push_notifications" : "in_app_notifications";
                            setNotificationData((prev: any) => ({
                              ...prev,
                              notification_settings: {
                                ...prev.notification_settings,
                                [key]: e.target.checked,
                              },
                            }));
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <span>🔔</span>
                  <span>Preferensi Notifikasi</span>
                </h4>
                <div className="space-y-3">
                  {[
                    { id: "order_updates", label: "Pembaruan Pesanan", enabled: true },
                    { id: "product_reviews", label: "Ulasan Produk", enabled: true },
                    { id: "system_alerts", label: "Alert Sistem", enabled: true },
                    { id: "promotions", label: "Info Promosi", enabled: false },
                  ].map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <span className="font-semibold text-amber-900">{pref.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pref.enabled} 
                          onChange={(e) => {
                            setNotificationData((prev: any) => ({
                              ...prev,
                              notification_settings: {
                                ...prev.notification_settings,
                                preferences: {
                                  ...prev.notification_settings.preferences,
                                  [pref.id]: e.target.checked,
                                },
                              },
                            }));
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  💾 Simpan Pengaturan
                </button>
              </div>

              {/* Last Updated */}
              <p className="text-xs text-amber-700 text-center pt-4 border-t border-orange-200">
                Terakhir diperbarui:{" "}
                {new Date(notificationData.notification_settings.last_updated).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
