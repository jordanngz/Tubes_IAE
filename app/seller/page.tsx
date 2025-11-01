"use client";

import { useState } from "react";
import Link from "next/link";

// Dashboard data placeholder
const dashboardData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    store_logo: "/images/store/logo-placeholder.png",
    store_status: "approved",
    verified_at: "2025-10-15T00:00:00Z",
    joined_at: "2025-10-01T00:00:00Z",
  },
  summary_cards: {
    total_orders_today: 5,
    total_revenue_today: 250000.0,
    pending_orders: 3,
    total_products: 25,
    active_promotions: 2,
    store_rating: 4.5,
  },
  sales_overview: {
    period: {
      start: "2025-10-01",
      end: "2025-11-01",
    },
    total_orders: 120,
    total_revenue: 4850000.0,
    average_order_value: 40416.67,
    total_buyers: 112,
    growth_percentage: 8.5,
    chart_data: [
      { date: "2025-10-25", orders: 10, revenue: 450000.0 },
      { date: "2025-10-26", orders: 12, revenue: 520000.0 },
      { date: "2025-10-27", orders: 8, revenue: 385000.0 },
    ],
  },
  recent_orders: [
    {
      order_id: null,
      order_number: "ORD-PLACEHOLDER-001",
      buyer_name: "Nama Pembeli Placeholder",
      total_amount: 85000.0,
      status: "processing",
      payment_status: "paid",
      created_at: "2025-11-01T09:00:00Z",
    },
    {
      order_id: null,
      order_number: "ORD-PLACEHOLDER-002",
      buyer_name: "Nama Pembeli Placeholder 2",
      total_amount: 65000.0,
      status: "shipped",
      payment_status: "paid",
      created_at: "2025-10-31T17:30:00Z",
    },
  ],
  top_selling_products: [
    {
      product_id: null,
      product_name: "Sarden Pedas 350g",
      image_url: "/images/products/placeholder-1.jpg",
      total_sold: 120,
      revenue: 3000000.0,
      rating_avg: 4.7,
    },
    {
      product_id: null,
      product_name: "Tuna Kaleng Original 200g",
      image_url: "/images/products/placeholder-2.jpg",
      total_sold: 80,
      revenue: 1600000.0,
      rating_avg: 4.5,
    },
  ],
  shipment_status_summary: {
    total_shipments: 50,
    pending_pickup: 10,
    in_transit: 20,
    delivered: 18,
    returned: 2,
  },
  review_summary: {
    total_reviews: 45,
    average_rating: 4.4,
    positive_reviews: 35,
    neutral_reviews: 8,
    negative_reviews: 2,
    recent_reviews: [
      {
        review_id: null,
        product_name: "Sarden Pedas 350g",
        rating: 5,
        title: "Produk Mantap!",
        body: "Rasa sarden-nya pedasnya pas banget, enak!",
        created_at: "2025-10-31T12:00:00Z",
      },
      {
        review_id: null,
        product_name: "Tuna Kaleng Original 200g",
        rating: 4,
        title: "Bagus tapi bisa lebih gurih",
        body: "Produk oke, tapi rasa bisa ditingkatkan.",
        created_at: "2025-10-30T10:00:00Z",
      },
    ],
  },
  promotion_highlights: [
    {
      promotion_id: null,
      name: "Diskon Awal Bulan",
      type: "percentage",
      value: 15.0,
      start_at: "2025-11-01T00:00:00Z",
      end_at: "2025-11-07T23:59:59Z",
      is_active: true,
      performance: {
        orders_using_promo: 12,
        total_discount_given: 180000.0,
      },
    },
    {
      promotion_id: null,
      name: "Gratis Ongkir Spesial",
      type: "fixed",
      value: 10000.0,
      start_at: "2025-10-25T00:00:00Z",
      end_at: "2025-10-30T23:59:59Z",
      is_active: false,
      performance: {
        orders_using_promo: 8,
        total_discount_given: 80000.0,
      },
    },
  ],
  notifications_preview: [
    {
      notification_id: null,
      title: "Pesanan Baru Diterima",
      message: "Pesanan #ORD-PLACEHOLDER-003 baru saja masuk.",
      created_at: "2025-11-01T09:15:00Z",
      status: "unread",
      icon: "🛒",
    },
    {
      notification_id: null,
      title: "Ulasan Baru",
      message: "Pembeli memberikan ulasan bintang 5 untuk produk 'Sarden Pedas 350g'.",
      created_at: "2025-11-01T10:00:00Z",
      status: "unread",
      icon: "⭐",
    },
  ],
  quick_actions: [
    {
      action_id: "add_product",
      label: "Tambah Produk Baru",
      icon: "➕",
      route: "/seller/products",
    },
    {
      action_id: "manage_orders",
      label: "Kelola Pesanan",
      icon: "📦",
      route: "/seller/orders",
    },
    {
      action_id: "create_promotion",
      label: "Buat Promosi",
      icon: "🎉",
      route: "/seller/promotions",
    },
    {
      action_id: "view_reports",
      label: "Lihat Laporan Penjualan",
      icon: "📈",
      route: "/seller/analytics",
    },
  ],
  activity_log: [
    {
      id: 1,
      type: "update_order_status",
      description: "Pesanan #ORD-PLACEHOLDER-001 diubah menjadi 'Dikirim'.",
      timestamp: "2025-11-01T08:00:00Z",
    },
    {
      id: 2,
      type: "add_product",
      description: "Menambahkan produk baru 'Sarden Pedas 350g'.",
      timestamp: "2025-11-01T09:00:00Z",
    },
    {
      id: 3,
      type: "reply_review",
      description: "Membalas ulasan pembeli untuk produk 'Tuna Kaleng Original 200g'.",
      timestamp: "2025-11-01T09:30:00Z",
    },
  ],
};

export default function SellerPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      processing: "bg-blue-100 text-blue-700 border-blue-300",
      shipped: "bg-purple-100 text-purple-700 border-purple-300",
      delivered: "bg-green-100 text-green-700 border-green-300",
      canceled: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status] || styles.pending;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      update_order_status: "🔄",
      add_product: "➕",
      reply_review: "💬",
      login: "🔐",
    };
    return icons[type] || "📦";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${Math.floor(diffHours / 24)} hari yang lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🏠</span>
            <span>Dashboard Seller</span>
          </h1>
          <p className="text-amber-800 mt-1">
            Selamat datang kembali, <span className="font-bold">{dashboardData.store_info.store_name}</span>!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-300">
            ✓ {dashboardData.store_info.store_status.toUpperCase()}
          </span>
          <span className="text-sm text-amber-700">
            Rating: {renderStars(dashboardData.summary_cards.store_rating)} {dashboardData.summary_cards.store_rating}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        {[
          {
            label: "Pesanan Hari Ini",
            value: dashboardData.summary_cards.total_orders_today,
            icon: "🛒",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Pendapatan Hari Ini",
            value: formatCurrency(dashboardData.summary_cards.total_revenue_today),
            icon: "💰",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Pesanan Pending",
            value: dashboardData.summary_cards.pending_orders,
            icon: "⏳",
            color: "from-yellow-400 to-orange-500",
          },
          {
            label: "Total Produk",
            value: dashboardData.summary_cards.total_products,
            icon: "📦",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Promosi Aktif",
            value: dashboardData.summary_cards.active_promotions,
            icon: "🎉",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Rating Toko",
            value: dashboardData.summary_cards.store_rating,
            icon: "⭐",
            color: "from-orange-400 to-red-500",
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {dashboardData.quick_actions.map((action) => (
          <Link
            key={action.action_id}
            href={action.route}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col items-center text-center group"
          >
            <span className="text-4xl mb-3 group-hover:scale-125 transition-transform">{action.icon}</span>
            <span className="font-bold text-sm">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Sales Overview */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <span>📊</span>
            <span>Ringkasan Penjualan</span>
          </h2>
          <span className="text-sm text-amber-700">
            {new Date(dashboardData.sales_overview.period.start).toLocaleDateString("id-ID")} -{" "}
            {new Date(dashboardData.sales_overview.period.end).toLocaleDateString("id-ID")}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Pesanan", value: dashboardData.sales_overview.total_orders, icon: "🛒" },
            { label: "Total Pendapatan", value: formatCurrency(dashboardData.sales_overview.total_revenue), icon: "💰" },
            { label: "Rata-rata Pesanan", value: formatCurrency(dashboardData.sales_overview.average_order_value), icon: "📈" },
            { label: "Total Pembeli", value: dashboardData.sales_overview.total_buyers, icon: "👥" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs text-amber-700">{item.label}</p>
              </div>
              <p className="text-lg font-bold text-amber-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Growth Badge */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold border-2 border-green-300 flex items-center gap-2">
            <span>📈</span>
            <span>Pertumbuhan {dashboardData.sales_overview.growth_percentage}% bulan ini</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>🛒</span>
              <span>Pesanan Terbaru</span>
            </h2>
            <Link
              href="/seller/orders"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData.recent_orders.map((order, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-amber-900">{order.order_number}</p>
                    <p className="text-sm text-amber-700">{order.buyer_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-orange-600">{formatCurrency(order.total_amount)}</p>
                  <p className="text-xs text-amber-700">{getTimeAgo(order.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Preview */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>🔔</span>
              <span>Notifikasi</span>
            </h2>
            <Link
              href="/seller/notifications"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Lihat →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData.notifications_preview.map((notif, idx) => (
              <div
                key={idx}
                className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{notif.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900 text-sm mb-1">{notif.title}</p>
                    <p className="text-xs text-amber-700 mb-1">{notif.message}</p>
                    <p className="text-xs text-amber-600">{getTimeAgo(notif.created_at)}</p>
                  </div>
                  {notif.status === "unread" && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>🏆</span>
              <span>Produk Terlaris</span>
            </h2>
            <Link
              href="/seller/products"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData.top_selling_products.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 mb-1">{product.product_name}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-amber-700">Terjual: {product.total_sold}</span>
                    <span className="text-amber-700">•</span>
                    <span className="flex items-center gap-1">
                      {renderStars(product.rating_avg)}
                      <span className="text-amber-700">{product.rating_avg}</span>
                    </span>
                  </div>
                  <p className="font-bold text-orange-600 mt-1">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Summary */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>⭐</span>
              <span>Ulasan Terbaru</span>
            </h2>
            <Link
              href="/seller/reviews"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          {/* Rating Summary */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-900">{dashboardData.review_summary.average_rating}</p>
                <div className="flex items-center gap-1">
                  {renderStars(dashboardData.review_summary.average_rating)}
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-green-700 font-bold">✓ {dashboardData.review_summary.positive_reviews} Positif</p>
                <p className="text-yellow-700 font-bold">• {dashboardData.review_summary.neutral_reviews} Netral</p>
                <p className="text-red-700 font-bold">✗ {dashboardData.review_summary.negative_reviews} Negatif</p>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-3">
            {dashboardData.review_summary.recent_reviews.map((review, idx) => (
              <div
                key={idx}
                className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-amber-900 text-sm">{review.product_name}</p>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-sm font-semibold text-amber-800 mb-1">{review.title}</p>
                <p className="text-xs text-amber-700 mb-1">{review.body}</p>
                <p className="text-xs text-amber-600">{getTimeAgo(review.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promotion Highlights */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>🎉</span>
              <span>Promosi Aktif</span>
            </h2>
            <Link
              href="/seller/promotions"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Kelola →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData.promotion_highlights.map((promo, idx) => (
              <div
                key={idx}
                className={`p-4 border-2 rounded-xl ${
                  promo.is_active
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-amber-900">{promo.name}</p>
                    <p className="text-sm text-amber-700">
                      {promo.type === "percentage" ? `Diskon ${promo.value}%` : `Diskon ${formatCurrency(promo.value)}`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      promo.is_active
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {promo.is_active ? "AKTIF" : "SELESAI"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-white rounded-lg">
                    <p className="text-xs text-amber-700">Digunakan</p>
                    <p className="font-bold text-amber-900">{promo.performance.orders_using_promo}x</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <p className="text-xs text-amber-700">Total Diskon</p>
                    <p className="font-bold text-orange-600">{formatCurrency(promo.performance.total_discount_given)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipment Status */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>🚚</span>
              <span>Status Pengiriman</span>
            </h2>
            <Link
              href="/seller/shipping"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Kelola →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Pengiriman", value: dashboardData.shipment_status_summary.total_shipments, icon: "📦", color: "blue" },
              { label: "Pending Pickup", value: dashboardData.shipment_status_summary.pending_pickup, icon: "⏳", color: "yellow" },
              { label: "Dalam Transit", value: dashboardData.shipment_status_summary.in_transit, icon: "🚚", color: "purple" },
              { label: "Terkirim", value: dashboardData.shipment_status_summary.delivered, icon: "✅", color: "green" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-2xl font-bold text-amber-900">{item.value}</p>
                <p className="text-xs text-amber-700 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {dashboardData.shipment_status_summary.returned > 0 && (
            <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-sm font-bold text-red-700">
                ⚠️ {dashboardData.shipment_status_summary.returned} pengiriman dikembalikan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-4">
          <span>📋</span>
          <span>Aktivitas Terakhir</span>
        </h2>

        <div className="space-y-3">
          {dashboardData.activity_log.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">{activity.description}</p>
                <p className="text-xs text-amber-700">
                  {new Date(activity.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
