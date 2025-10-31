"use client";

import { useState } from "react";

// Notifications & Activity data placeholder
const notificationData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    unread_notifications: 5,
    total_notifications: 120,
    recent_activity_count: 25,
    last_checked_at: "2025-11-01T00:00:00Z",
  },
  notifications: [
    {
      notification_id: null,
      type: "order_created",
      title: "Pesanan Baru Diterima",
      message: "Kamu mendapatkan pesanan baru #ORD-PLACEHOLDER-001.",
      related_order_id: null,
      related_product_id: null,
      status: "unread",
      priority: "high",
      icon: "🛒",
      created_at: "2025-11-01T08:30:00Z",
      read_at: null,
    },
    {
      notification_id: null,
      type: "product_review",
      title: "Ulasan Baru untuk Produkmu",
      message: "Pembeli memberikan ulasan bintang 5 untuk produk 'Sarden Pedas 350g'.",
      related_order_id: null,
      related_product_id: null,
      status: "read",
      priority: "medium",
      icon: "⭐",
      created_at: "2025-11-01T09:00:00Z",
      read_at: "2025-11-01T09:15:00Z",
    },
    {
      notification_id: null,
      type: "promotion_approved",
      title: "Promosi Telah Disetujui",
      message: "Promosi 'Diskon Awal Bulan' telah disetujui oleh admin.",
      related_order_id: null,
      related_product_id: null,
      status: "read",
      priority: "low",
      icon: "🎉",
      created_at: "2025-10-31T12:00:00Z",
      read_at: "2025-10-31T12:30:00Z",
    },
    {
      notification_id: null,
      type: "shipment_delivered",
      title: "Pesanan Telah Diterima Pembeli",
      message: "Pesanan #ORD-PLACEHOLDER-002 telah dikonfirmasi diterima oleh pembeli.",
      related_order_id: null,
      related_product_id: null,
      status: "unread",
      priority: "medium",
      icon: "📦",
      created_at: "2025-11-01T10:00:00Z",
      read_at: null,
    },
  ],
  activity_log: [
    {
      activity_id: null,
      type: "create_product",
      description: "Menambahkan produk baru 'Tuna Kaleng Original 200g'.",
      related_product_id: null,
      related_order_id: null,
      timestamp: "2025-11-01T07:30:00Z",
      ip_address: "192.168.1.10",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: "Bandung, Indonesia",
    },
    {
      activity_id: null,
      type: "update_order_status",
      description: "Mengubah status pesanan #ORD-PLACEHOLDER-001 menjadi 'Dikirim'.",
      related_order_id: null,
      timestamp: "2025-11-01T08:00:00Z",
      ip_address: "192.168.1.10",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: "Bandung, Indonesia",
    },
    {
      activity_id: null,
      type: "reply_review",
      description: "Membalas ulasan pembeli untuk produk 'Sarden Pedas 350g'.",
      related_product_id: null,
      timestamp: "2025-11-01T09:00:00Z",
      ip_address: "192.168.1.10",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: "Bandung, Indonesia",
    },
    {
      activity_id: null,
      type: "login",
      description: "Seller berhasil login ke dashboard seller.",
      timestamp: "2025-11-01T07:00:00Z",
      ip_address: "192.168.1.10",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      location: "Bandung, Indonesia",
    },
  ],
  activity_summary: {
    total_activities: 250,
    activities_today: 12,
    most_common_action: "update_order_status",
    recent_login_at: "2025-11-01T07:00:00Z",
    active_sessions: 1,
  },
  system_alerts: [
    {
      alert_id: null,
      level: "warning",
      title: "Stok Menipis",
      message: "Produk 'Sarden Pedas 350g' hanya tersisa 5 stok. Pertimbangkan untuk restok.",
      related_product_id: null,
      created_at: "2025-11-01T06:30:00Z",
    },
    {
      alert_id: null,
      level: "info",
      title: "Pembaruan Sistem",
      message: "Aplikasi seller akan diperbarui pada 2 November 2025 pukul 02:00 WIB.",
      created_at: "2025-10-31T10:00:00Z",
    },
  ],
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
    last_updated: "2025-10-30T12:00:00Z",
  },
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"notifications" | "activity">("notifications");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);

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
          <button className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2">
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
            value: notificationData.activity_summary.activities_today,
            icon: "⚡",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "Sesi Aktif",
            value: notificationData.activity_summary.active_sessions,
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
          {notificationData.system_alerts.map((alert, idx) => (
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
              <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium transition-colors">
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
            {notificationData.notifications.map((notification, idx) => (
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
                            <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
                              ✅ Tandai Dibaca
                            </button>
                          )}
                          <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors">
                            👁️ Detail
                          </button>
                          <button className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors">
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
                <p className="text-3xl font-bold text-blue-900">{notificationData.activity_summary.total_activities}</p>
                <p className="text-sm text-blue-700">Total Aktivitas</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl">
                  ⚡
                </div>
                <p className="text-3xl font-bold text-orange-900">{notificationData.activity_summary.activities_today}</p>
                <p className="text-sm text-orange-700">Hari Ini</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl">
                  🔄
                </div>
                <p className="text-sm font-bold text-green-900">{notificationData.activity_summary.most_common_action}</p>
                <p className="text-sm text-green-700">Aksi Terbanyak</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl">
                  🔐
                </div>
                <p className="text-sm font-bold text-purple-900">
                  {new Date(notificationData.activity_summary.recent_login_at).toLocaleTimeString("id-ID", {
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
              {notificationData.activity_log.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  {/* Timeline Line */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    {idx < notificationData.activity_log.length - 1 && (
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
                        <input type="checkbox" checked={channel.enabled} className="sr-only peer" readOnly />
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
                        <input type="checkbox" checked={pref.enabled} className="sr-only peer" readOnly />
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
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
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
    </div>
  );
}
