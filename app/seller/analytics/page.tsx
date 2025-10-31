"use client";

import { useState } from "react";

// Analytics data placeholder
const analyticsData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    period: {
      start: "2025-10-01",
      end: "2025-11-01",
    },
    generated_at: "2025-11-01T00:00:00Z",
  },
  sales_overview: {
    total_orders: 120,
    completed_orders: 95,
    canceled_orders: 5,
    returned_orders: 2,
    total_revenue: 4850000.0,
    average_order_value: 40416.67,
    total_products_sold: 370,
    total_buyers: 112,
  },
  sales_trend: [
    {
      date: "2025-10-25",
      order_count: 10,
      revenue: 450000.0,
    },
    {
      date: "2025-10-26",
      order_count: 12,
      revenue: 520000.0,
    },
    {
      date: "2025-10-27",
      order_count: 8,
      revenue: 385000.0,
    },
  ],
  top_products: [
    {
      product_id: null,
      product_name: "Sarden Pedas 350g",
      total_sold: 120,
      revenue: 3000000.0,
      average_rating: 4.6,
      stock_remaining: 30,
    },
    {
      product_id: null,
      product_name: "Tuna Kaleng Original 200g",
      total_sold: 80,
      revenue: 1600000.0,
      average_rating: 4.3,
      stock_remaining: 45,
    },
  ],
  category_performance: [
    {
      category_id: null,
      category_name: "Makanan Kaleng",
      total_products: 15,
      total_sold: 200,
      revenue: 4200000.0,
    },
    {
      category_id: null,
      category_name: "Seafood",
      total_products: 5,
      total_sold: 50,
      revenue: 650000.0,
    },
  ],
  payment_summary: {
    total_transactions: 120,
    successful_payments: 115,
    failed_payments: 5,
    payment_methods: [
      {
        method: "Midtrans - Bank Transfer",
        transaction_count: 80,
        total_amount: 3500000.0,
      },
      {
        method: "Midtrans - E-Wallet",
        transaction_count: 40,
        total_amount: 1350000.0,
      },
    ],
  },
  shipping_summary: {
    total_shipments: 120,
    delivered: 110,
    in_transit: 8,
    returned: 2,
    average_delivery_time_days: 2.4,
    top_carriers: [
      {
        carrier_name: "JNE",
        shipment_count: 70,
        on_time_rate: 94.0,
      },
      {
        carrier_name: "SiCepat",
        shipment_count: 30,
        on_time_rate: 90.5,
      },
      {
        carrier_name: "POS Indonesia",
        shipment_count: 20,
        on_time_rate: 89.0,
      },
    ],
  },
  customer_feedback: {
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
        title: "Enak banget!",
        body: "Rasa pedasnya mantap dan tidak amis.",
        created_at: "2025-10-30T09:00:00Z",
      },
      {
        review_id: null,
        product_name: "Tuna Kaleng Original 200g",
        rating: 3,
        title: "Kurang kuat rasanya",
        body: "Harusnya lebih gurih sedikit.",
        created_at: "2025-10-29T15:30:00Z",
      },
    ],
  },
  financial_report: {
    gross_revenue: 4850000.0,
    total_discounts: 250000.0,
    total_fees: 145000.0,
    net_revenue: 4455000.0,
    estimated_payout: 4400000.0,
    last_payout_date: "2025-10-31T00:00:00Z",
  },
  activity_log: [
    {
      id: 1,
      type: "generate_report",
      description: "Seller menghasilkan laporan penjualan mingguan.",
      timestamp: "2025-11-01T00:00:00Z",
    },
    {
      id: 2,
      type: "export_report",
      description: "Laporan keuangan diekspor ke format PDF.",
      timestamp: "2025-11-01T00:15:00Z",
    },
    {
      id: 3,
      type: "filter_applied",
      description: "Seller memfilter laporan berdasarkan kategori 'Makanan Kaleng'.",
      timestamp: "2025-11-01T00:20:00Z",
    },
  ],
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");
  const [showExportModal, setShowExportModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-sm ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>📈</span>
            <span>Laporan Analitik</span>
          </h1>
          <p className="text-amber-800 mt-1">Dashboard analitik dan laporan penjualan toko Anda</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="today">Hari Ini</option>
            <option value="last_7_days">7 Hari Terakhir</option>
            <option value="last_30_days">30 Hari Terakhir</option>
            <option value="this_month">Bulan Ini</option>
            <option value="last_month">Bulan Lalu</option>
            <option value="custom">Custom Range</option>
          </select>
          <button
            onClick={() => setShowExportModal(!showExportModal)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>📥</span>
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {/* Period Info */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xl">
            📅
          </div>
          <div>
            <p className="text-sm text-blue-700 font-medium">Periode Laporan</p>
            <p className="text-lg font-bold text-blue-900">
              {new Date(analyticsData.store_info.period.start).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date(analyticsData.store_info.period.end).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-700">Dibuat pada</p>
          <p className="font-semibold text-blue-900">
            {new Date(analyticsData.store_info.generated_at).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* Sales Overview - Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        {[
          {
            label: "Total Pesanan",
            value: analyticsData.sales_overview.total_orders,
            icon: "🛒",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Total Pendapatan",
            value: formatCurrency(analyticsData.sales_overview.total_revenue),
            icon: "💰",
            color: "from-green-400 to-emerald-500",
            highlight: true,
          },
          {
            label: "Produk Terjual",
            value: analyticsData.sales_overview.total_products_sold,
            icon: "📦",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Total Pembeli",
            value: analyticsData.sales_overview.total_buyers,
            icon: "👥",
            color: "from-orange-400 to-red-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
              stat.highlight ? "md:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <p
                className={`font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                  stat.highlight ? "text-xl" : "text-2xl"
                }`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-amber-700 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Status Pesanan</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Selesai",
              value: analyticsData.sales_overview.completed_orders,
              icon: "✅",
              color: "from-green-400 to-emerald-500",
            },
            {
              label: "Dibatalkan",
              value: analyticsData.sales_overview.canceled_orders,
              icon: "❌",
              color: "from-red-400 to-pink-500",
            },
            {
              label: "Dikembalikan",
              value: analyticsData.sales_overview.returned_orders,
              icon: "↩️",
              color: "from-orange-400 to-amber-500",
            },
            {
              label: "Nilai Rata-rata",
              value: formatCurrency(analyticsData.sales_overview.average_order_value),
              icon: "💵",
              color: "from-blue-400 to-cyan-500",
            },
          ].map((stat, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl">
                  {stat.icon}
                </div>
                <p className="text-sm text-amber-700 font-medium">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-bold text-amber-900">Tren Penjualan</h2>
        </div>

        <div className="space-y-3">
          {analyticsData.sales_trend.map((trend, idx) => {
            const maxRevenue = Math.max(...analyticsData.sales_trend.map((t) => t.revenue));
            const percentage = (trend.revenue / maxRevenue) * 100;

            return (
              <div key={idx} className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {trend.order_count}
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">
                        {new Date(trend.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-amber-700">{trend.order_count} pesanan</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatCurrency(trend.revenue)}
                  </p>
                </div>
                <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-amber-900">Produk Terlaris</h2>
        </div>

        <div className="space-y-3">
          {analyticsData.top_products.map((product, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">{product.product_name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {renderStars(Math.round(product.average_rating))}
                      <span className="text-sm font-semibold text-amber-700">
                        {product.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-amber-700">
                        <strong>{product.total_sold}</strong> terjual
                      </span>
                      <span className="text-amber-700">
                        Stok: <strong>{product.stock_remaining}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatCurrency(product.revenue)}
                  </p>
                  <p className="text-xs text-amber-700">Pendapatan</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance & Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📁</span>
            <h2 className="text-xl font-bold text-amber-900">Performa Kategori</h2>
          </div>

          <div className="space-y-3">
            {analyticsData.category_performance.map((category, idx) => (
              <div key={idx} className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-amber-900">{category.category_name}</p>
                  <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">
                    {category.total_products} produk
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-amber-700">Terjual</p>
                    <p className="font-bold text-amber-900">{category.total_sold} unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-700">Pendapatan</p>
                    <p className="font-bold text-amber-900">{formatCurrency(category.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💳</span>
            <h2 className="text-xl font-bold text-amber-900">Ringkasan Pembayaran</h2>
          </div>

          <div className="space-y-4">
            {/* Payment Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg text-center border-2 border-blue-200">
                <p className="text-2xl font-bold text-blue-900">{analyticsData.payment_summary.total_transactions}</p>
                <p className="text-xs text-blue-700">Total</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg text-center border-2 border-green-200">
                <p className="text-2xl font-bold text-green-900">{analyticsData.payment_summary.successful_payments}</p>
                <p className="text-xs text-green-700">Berhasil</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg text-center border-2 border-red-200">
                <p className="text-2xl font-bold text-red-900">{analyticsData.payment_summary.failed_payments}</p>
                <p className="text-xs text-red-700">Gagal</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <p className="font-semibold text-amber-900">Metode Pembayaran</p>
              {analyticsData.payment_summary.payment_methods.map((method, idx) => {
                const percentage = getPercentage(
                  method.transaction_count,
                  analyticsData.payment_summary.total_transactions
                );

                return (
                  <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-amber-900">{method.method}</p>
                      <p className="text-sm font-bold text-amber-900">{formatCurrency(method.total_amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-amber-700 font-semibold">{percentage}%</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">{method.transaction_count} transaksi</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Summary */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🚚</span>
          <h2 className="text-xl font-bold text-amber-900">Ringkasan Pengiriman</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping Stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Pengiriman", value: analyticsData.shipping_summary.total_shipments, icon: "📦" },
                { label: "Terkirim", value: analyticsData.shipping_summary.delivered, icon: "✅" },
                { label: "Dalam Perjalanan", value: analyticsData.shipping_summary.in_transit, icon: "🚚" },
                { label: "Dikembalikan", value: analyticsData.shipping_summary.returned, icon: "↩️" },
              ].map((stat, idx) => (
                <div key={idx} className="p-3 bg-orange-50 rounded-lg text-center">
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-amber-700">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl text-center">
              <p className="text-sm text-blue-700 mb-1">Rata-rata Waktu Pengiriman</p>
              <p className="text-3xl font-bold text-blue-900">
                {analyticsData.shipping_summary.average_delivery_time_days} <span className="text-lg">hari</span>
              </p>
            </div>
          </div>

          {/* Top Carriers */}
          <div className="space-y-2">
            <p className="font-semibold text-amber-900 mb-3">Kurir Terpopuler</p>
            {analyticsData.shipping_summary.top_carriers.map((carrier, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <p className="font-bold text-amber-900">{carrier.carrier_name}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      carrier.on_time_rate >= 90
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {carrier.on_time_rate}% tepat waktu
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                      style={{
                        width: `${getPercentage(carrier.shipment_count, analyticsData.shipping_summary.total_shipments)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-amber-900">{carrier.shipment_count} pengiriman</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Feedback & Financial Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Feedback */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⭐</span>
            <h2 className="text-xl font-bold text-amber-900">Feedback Pelanggan</h2>
          </div>

          {/* Rating Overview */}
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl mb-4">
            <div className="text-center mb-3">
              <p className="text-4xl font-bold text-amber-900">{analyticsData.customer_feedback.average_rating}</p>
              {renderStars(Math.round(analyticsData.customer_feedback.average_rating))}
              <p className="text-sm text-amber-700 mt-1">{analyticsData.customer_feedback.total_reviews} ulasan</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{analyticsData.customer_feedback.positive_reviews}</p>
                <p className="text-xs text-green-700">Positif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.customer_feedback.neutral_reviews}</p>
                <p className="text-xs text-blue-700">Netral</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analyticsData.customer_feedback.negative_reviews}</p>
                <p className="text-xs text-red-700">Negatif</p>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-2">
            <p className="font-semibold text-amber-900 text-sm">Ulasan Terbaru</p>
            {analyticsData.customer_feedback.recent_reviews.map((review, idx) => (
              <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-amber-900">{review.product_name}</p>
                  {renderStars(review.rating)}
                </div>
                <p className="text-xs font-bold text-amber-900 mb-1">{review.title}</p>
                <p className="text-xs text-amber-700">{review.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Report */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💰</span>
            <h2 className="text-xl font-bold text-amber-900">Laporan Keuangan</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Pendapatan Kotor",
                value: analyticsData.financial_report.gross_revenue,
                color: "from-blue-50 to-cyan-50",
                borderColor: "border-blue-200",
                textColor: "text-blue-900",
              },
              {
                label: "Total Diskon",
                value: -analyticsData.financial_report.total_discounts,
                color: "from-orange-50 to-amber-50",
                borderColor: "border-orange-200",
                textColor: "text-orange-900",
              },
              {
                label: "Biaya Platform",
                value: -analyticsData.financial_report.total_fees,
                color: "from-red-50 to-pink-50",
                borderColor: "border-red-200",
                textColor: "text-red-900",
              },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 bg-gradient-to-r ${item.color} border-2 ${item.borderColor} rounded-xl`}>
                <p className={`text-sm ${item.textColor} font-medium mb-1`}>{item.label}</p>
                <p className={`text-2xl font-bold ${item.textColor}`}>{formatCurrency(Math.abs(item.value))}</p>
              </div>
            ))}

            <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl">
              <p className="text-sm text-green-700 font-medium mb-1">Pendapatan Bersih</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(analyticsData.financial_report.net_revenue)}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Estimasi Pencairan</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(analyticsData.financial_report.estimated_payout)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xl">
                  💸
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-2">
                Pencairan terakhir:{" "}
                {new Date(analyticsData.financial_report.last_payout_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Laporan Terbaru</h2>
        </div>

        <div className="space-y-3">
          {analyticsData.activity_log.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold shrink-0">
                {activity.type === "generate_report"
                  ? "📈"
                  : activity.type === "export_report"
                  ? "📥"
                  : activity.type === "filter_applied"
                  ? "🔍"
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <span>📥</span>
                <span>Ekspor Laporan</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Pilih Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PDF", "XLSX", "CSV"].map((format) => (
                    <button
                      key={format}
                      className="px-4 py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 rounded-lg font-semibold text-amber-900 transition-colors"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Periode</label>
                <select className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option>30 Hari Terakhir</option>
                  <option>7 Hari Terakhir</option>
                  <option>Bulan Ini</option>
                  <option>Bulan Lalu</option>
                  <option>Custom Range</option>
                </select>
              </div>

              <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>📥</span>
                <span>Unduh Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
