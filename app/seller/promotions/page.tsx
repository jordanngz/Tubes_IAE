"use client";

import { useState } from "react";
import Link from "next/link";

// Promotion & Coupon data placeholder
const promoData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    total_promotions: 0,
    active_promotions: 0,
    total_coupons: 0,
    active_coupons: 0,
  },
  promotions: [
    {
      promotion_id: null,
      store_id: null,
      name: "Promo Awal Bulan Placeholder",
      description: "Diskon spesial untuk semua produk makanan kaleng di awal bulan.",
      type: "percentage",
      value: 15.0,
      start_at: "2025-11-01T00:00:00Z",
      end_at: "2025-11-07T23:59:59Z",
      is_active: true,
      banner: "/images/promotions/banner-placeholder.jpg",
      applied_to: [
        {
          promotionable_type: "product",
          promotionable_id: null,
          name: "Sarden Pedas 350g",
          sku: "SKU-SP350",
        },
        {
          promotionable_type: "category",
          promotionable_id: null,
          name: "Makanan Kaleng",
          slug: "makanan-kaleng",
        },
      ],
      statistics: {
        total_sales_during_promo: 120,
        total_discount_given: 450000.0,
        unique_buyers: 85,
      },
      created_at: "2025-10-25T00:00:00Z",
      updated_at: "2025-10-25T00:00:00Z",
    },
  ],
  coupons: [
    {
      coupon_id: null,
      store_id: null,
      code: "CANNDISCOUNT15",
      type: "percentage",
      value: 15.0,
      max_discount: 30000.0,
      min_order_amount: 100000.0,
      start_at: "2025-11-01T00:00:00Z",
      end_at: "2025-11-10T23:59:59Z",
      usage_limit: 100,
      per_user_limit: 2,
      is_active: true,
      title: "Diskon 15% untuk Semua Produk",
      description: "Gunakan kode ini untuk mendapatkan diskon 15% hingga Rp30.000!",
      redemption_count: 45,
      created_at: "2025-10-28T00:00:00Z",
      updated_at: "2025-10-28T00:00:00Z",
    },
  ],
  coupon_redemptions: [
    {
      redemption_id: null,
      coupon_id: null,
      user_id: null,
      user_name: "Nama Pembeli Placeholder",
      order_id: null,
      order_number: "ORD-PLACEHOLDER-001",
      discount_amount: 15000.0,
      redeemed_at: "2025-11-02T14:00:00Z",
    },
    {
      redemption_id: null,
      coupon_id: null,
      user_id: null,
      user_name: "Nama Pembeli Placeholder 2",
      order_id: null,
      order_number: "ORD-PLACEHOLDER-002",
      discount_amount: 20000.0,
      redeemed_at: "2025-11-02T15:30:00Z",
    },
  ],
  promotion_statistics: {
    total_promotions: 5,
    active_promotions: 3,
    expired_promotions: 1,
    upcoming_promotions: 1,
    total_discount_given: 1200000.0,
  },
  coupon_statistics: {
    total_coupons: 10,
    active_coupons: 6,
    expired_coupons: 2,
    used_coupons: 120,
    total_discount_granted: 650000.0,
  },
  activity_log: [
    {
      id: 1,
      type: "create_promotion",
      description: "Membuat promosi baru 'Promo Awal Bulan Placeholder'.",
      timestamp: "2025-10-25T00:00:00Z",
    },
    {
      id: 2,
      type: "create_coupon",
      description: "Menambahkan kupon baru 'CANNDISCOUNT15'.",
      timestamp: "2025-10-28T00:00:00Z",
    },
    {
      id: 3,
      type: "coupon_redeemed",
      description: "Kupon 'CANNDISCOUNT15' digunakan oleh pembeli ORD-PLACEHOLDER-001.",
      timestamp: "2025-11-02T14:00:00Z",
    },
  ],
};

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<"promotions" | "coupons">("promotions");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountDisplay = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  const getPromotionStatus = (startAt: string, endAt: string, isActive: boolean) => {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (!isActive) return { label: "Nonaktif", color: "bg-gray-100 text-gray-700 border-gray-300" };
    if (now < start) return { label: "Akan Datang", color: "bg-blue-100 text-blue-700 border-blue-300" };
    if (now > end) return { label: "Kadaluarsa", color: "bg-red-100 text-red-700 border-red-300" };
    return { label: "Aktif", color: "bg-green-100 text-green-700 border-green-300" };
  };

  const getCouponUsagePercent = (redemptionCount: number, usageLimit: number) => {
    return Math.round((redemptionCount / usageLimit) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🎟️</span>
            <span>Promosi dan Kupon</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola promosi dan kupon untuk meningkatkan penjualan</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span>➕</span>
          <span>Buat {activeTab === "promotions" ? "Promosi" : "Kupon"} Baru</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("promotions")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "promotions"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
              : "text-amber-900 hover:bg-orange-50"
          }`}
        >
          <span className="text-xl">🎯</span>
          <span>Promosi</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "promotions" ? "bg-white text-orange-600" : "bg-orange-200 text-orange-800"
            }`}
          >
            {promoData.promotion_statistics.active_promotions}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "coupons"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
              : "text-amber-900 hover:bg-orange-50"
          }`}
        >
          <span className="text-xl">🎫</span>
          <span>Kupon</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "coupons" ? "bg-white text-orange-600" : "bg-orange-200 text-orange-800"
            }`}
          >
            {promoData.coupon_statistics.active_coupons}
          </span>
        </button>
      </div>

      {/* Statistics Cards */}
      {activeTab === "promotions" ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
          {[
            {
              label: "Total Promosi",
              value: promoData.promotion_statistics.total_promotions,
              icon: "🎯",
              color: "from-blue-400 to-cyan-500",
            },
            {
              label: "Aktif",
              value: promoData.promotion_statistics.active_promotions,
              icon: "✅",
              color: "from-green-400 to-emerald-500",
            },
            {
              label: "Akan Datang",
              value: promoData.promotion_statistics.upcoming_promotions,
              icon: "⏰",
              color: "from-blue-400 to-indigo-500",
            },
            {
              label: "Kadaluarsa",
              value: promoData.promotion_statistics.expired_promotions,
              icon: "⏱️",
              color: "from-red-400 to-pink-500",
            },
            {
              label: "Total Diskon Diberikan",
              value: formatCurrency(promoData.promotion_statistics.total_discount_given),
              icon: "💰",
              color: "from-orange-400 to-red-500",
              isLarge: true,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                stat.isLarge ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{stat.icon}</span>
                <p
                  className={`font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                    stat.isLarge ? "text-base" : "text-2xl"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-amber-700 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
          {[
            {
              label: "Total Kupon",
              value: promoData.coupon_statistics.total_coupons,
              icon: "🎫",
              color: "from-purple-400 to-pink-500",
            },
            {
              label: "Aktif",
              value: promoData.coupon_statistics.active_coupons,
              icon: "✅",
              color: "from-green-400 to-emerald-500",
            },
            {
              label: "Kadaluarsa",
              value: promoData.coupon_statistics.expired_coupons,
              icon: "⏱️",
              color: "from-red-400 to-pink-500",
            },
            {
              label: "Terpakai",
              value: promoData.coupon_statistics.used_coupons,
              icon: "✨",
              color: "from-blue-400 to-indigo-500",
            },
            {
              label: "Total Diskon",
              value: formatCurrency(promoData.coupon_statistics.total_discount_granted),
              icon: "💰",
              color: "from-orange-400 to-red-500",
              isLarge: true,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                stat.isLarge ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{stat.icon}</span>
                <p
                  className={`font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                    stat.isLarge ? "text-base" : "text-2xl"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-amber-700 mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promotions Tab Content */}
      {activeTab === "promotions" && (
        <div className="space-y-4 animate-fade-in">
          {promoData.promotions.map((promo, idx) => {
            const status = getPromotionStatus(promo.start_at, promo.end_at, promo.is_active);

            return (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Promotion Header */}
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 border-b-2 border-orange-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg">
                        🎯
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-amber-900">{promo.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border-2 border-purple-300">
                            {promo.type === "percentage" ? "%" : "Rp"} {getDiscountDisplay(promo.type, promo.value)}
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">{promo.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotion Content */}
                <div className="p-4 space-y-4">
                  {/* Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-amber-700 flex items-center gap-2">
                        <span>📅</span>
                        <span>Mulai</span>
                      </p>
                      <p className="font-bold text-amber-900">
                        {new Date(promo.start_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-700 flex items-center gap-2">
                        <span>⏰</span>
                        <span>Berakhir</span>
                      </p>
                      <p className="font-bold text-amber-900">
                        {new Date(promo.end_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Applied To */}
                  <div>
                    <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <span>🎯</span>
                      <span>Diterapkan Pada</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {promo.applied_to.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="px-3 py-2 bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-lg flex items-center gap-2"
                        >
                          <span className="text-lg">{item.promotionable_type === "product" ? "📦" : "📁"}</span>
                          <div>
                            <p className="text-sm font-semibold text-amber-900">{item.name}</p>
                            {item.promotionable_type === "product" && (
                              <p className="text-xs text-amber-700">SKU: {item.sku}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xl">
                        🛒
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{promo.statistics.total_sales_during_promo}</p>
                      <p className="text-xs text-blue-700">Penjualan</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xl">
                        👥
                      </div>
                      <p className="text-2xl font-bold text-green-900">{promo.statistics.unique_buyers}</p>
                      <p className="text-xs text-green-700">Pembeli Unik</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl">
                        💰
                      </div>
                      <p className="text-lg font-bold text-orange-900">
                        {formatCurrency(promo.statistics.total_discount_given)}
                      </p>
                      <p className="text-xs text-orange-700">Total Diskon</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-200">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors flex items-center gap-2">
                      <span>👁️</span>
                      <span>Detail</span>
                    </button>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2">
                      <span>📊</span>
                      <span>Statistik</span>
                    </button>
                    {promo.is_active ? (
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-2">
                        <span>⏸️</span>
                        <span>Nonaktifkan</span>
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition-colors flex items-center gap-2">
                        <span>▶️</span>
                        <span>Aktifkan</span>
                      </button>
                    )}
                    <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                      <span>🗑️</span>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coupons Tab Content */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-fade-in">
          {/* Coupons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {promoData.coupons.map((coupon, idx) => {
              const status = getPromotionStatus(coupon.start_at, coupon.end_at, coupon.is_active);
              const usagePercent = getCouponUsagePercent(coupon.redemption_count, coupon.usage_limit);

              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Coupon Header with Dashed Border Design */}
                  <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-6">
                    <div className="absolute top-0 left-0 right-0 h-4 bg-white" style={{ 
                      maskImage: "radial-gradient(circle at 10px, transparent 8px, black 8px)",
                      maskSize: "20px 100%",
                      maskRepeat: "repeat-x"
                    }}></div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{ 
                      maskImage: "radial-gradient(circle at 10px, transparent 8px, black 8px)",
                      maskSize: "20px 100%",
                      maskRepeat: "repeat-x"
                    }}></div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-4xl">🎫</span>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">{coupon.title}</h3>
                      <p className="text-white/90 text-sm mb-3">{coupon.description}</p>

                      {/* Coupon Code */}
                      <div className="bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-lg p-3 mb-3">
                        <p className="text-xs text-white/80 mb-1">Kode Kupon</p>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-white tracking-wider font-mono">{coupon.code}</p>
                          <button className="px-3 py-1 bg-white text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors">
                            📋 Salin
                          </button>
                        </div>
                      </div>

                      {/* Discount Value */}
                      <div className="flex items-center gap-2">
                        <span className="text-5xl font-bold text-white">
                          {getDiscountDisplay(coupon.type, coupon.value)}
                        </span>
                        <span className="text-white/80 text-sm">OFF</span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Content */}
                  <div className="p-4 space-y-4">
                    {/* Terms */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-amber-700 mb-1">Min. Pembelian</p>
                        <p className="font-bold text-amber-900">{formatCurrency(coupon.min_order_amount)}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-amber-700 mb-1">Max. Diskon</p>
                        <p className="font-bold text-amber-900">{formatCurrency(coupon.max_discount)}</p>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-blue-900">Penggunaan Kupon</p>
                        <p className="text-sm font-bold text-blue-900">
                          {coupon.redemption_count} / {coupon.usage_limit}
                        </p>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        {usagePercent}% terpakai • Maks. {coupon.per_user_limit}x per pengguna
                      </p>
                    </div>

                    {/* Period */}
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-amber-700 mb-1">Periode Berlaku</p>
                      <p className="text-sm font-semibold text-amber-900">
                        {new Date(coupon.start_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} -{" "}
                        {new Date(coupon.end_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-200">
                      <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                        <span>📊</span>
                        <span>Detail</span>
                      </button>
                      <button className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center justify-center gap-2">
                        <span>🗑️</span>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Redemptions */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-amber-900">Riwayat Penggunaan Kupon</h2>
            </div>

            <div className="space-y-3">
              {promoData.coupon_redemptions.map((redemption, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {redemption.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">{redemption.user_name}</p>
                      <p className="text-sm text-amber-700">Pesanan: {redemption.order_number}</p>
                      <p className="text-xs text-amber-600">
                        {new Date(redemption.redeemed_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      -{formatCurrency(redemption.discount_amount)}
                    </p>
                    <p className="text-xs text-amber-700">Diskon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Terbaru</h2>
        </div>

        <div className="space-y-3">
          {promoData.activity_log.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold shrink-0">
                {activity.type === "create_promotion"
                  ? "🎯"
                  : activity.type === "create_coupon"
                  ? "🎫"
                  : activity.type === "coupon_redeemed"
                  ? "✨"
                  : "📦"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">{activity.description}</p>
                <p className="text-xs text-amber-700 mt-1">
                  {new Date(activity.timestamp).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
