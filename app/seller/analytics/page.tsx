"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";

// Data will be fetched from API

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "XLSX" | "PDF">("CSV");
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!user) return;
        setLoading(true);
        const token = await user.getIdToken();
        const params = new URLSearchParams({ period: selectedPeriod });
        if (selectedPeriod === "custom" && customStart && customEnd) {
          params.set("start", new Date(customStart).toISOString());
          params.set("end", new Date(customEnd).toISOString());
        }
        const res = await fetch(`/api/seller/analytics?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        if (res.ok) setAnalytics(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user, selectedPeriod, customStart, customEnd]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentage = (value: number, total: number) => {
    if (!total || total <= 0) return "0.0";
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

  const salesTrend = useMemo(() => analytics?.sales_trend || [], [analytics]);
  const topProducts = useMemo(() => analytics?.top_products || [], [analytics]);
  const categories = useMemo(() => analytics?.category_performance || [], [analytics]);
  const paymentSummary = analytics?.payment_summary || { total_transactions: 0, successful_payments: 0, failed_payments: 0, payment_methods: [] };
  const shippingSummary = analytics?.shipping_summary || { total_shipments: 0, delivered: 0, in_transit: 0, returned: 0, average_delivery_time_days: 0, top_carriers: [] };
  const customerFeedback = analytics?.customer_feedback || { total_reviews: 0, average_rating: 0, positive_reviews: 0, neutral_reviews: 0, negative_reviews: 0, recent_reviews: [] };
  const financialReport = analytics?.financial_report || { gross_revenue: 0, total_discounts: 0, total_fees: 0, net_revenue: 0, estimated_payout: 0, last_payout_date: new Date().toISOString() };
  const storeInfo = analytics?.store_info || { period: { start: new Date().toISOString(), end: new Date().toISOString() }, generated_at: new Date().toISOString(), store_name: "" };

  const handleExport = async () => {
    if (!user) return;
    // Validate custom range
    if (selectedPeriod === "custom") {
      if (!customStart || !customEnd) {
        alert("Mohon pilih tanggal mulai dan akhir.");
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
        return;
      }
    }
    try {
      setExporting(true);
      const token = await user.getIdToken();
      const params = new URLSearchParams({ period: selectedPeriod, format: exportFormat.toLowerCase() });
      if (selectedPeriod === "custom" && customStart && customEnd) {
        params.set("start", new Date(customStart).toISOString());
        params.set("end", new Date(customEnd).toISOString());
      }
      const res = await fetch(`/api/seller/analytics/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengekspor laporan");
      }
      const blob = await res.blob();
      let ext = exportFormat === "XLSX" ? "xlsx" : exportFormat === "CSV" ? "csv" : "pdf";
      let fileName = `analytics_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.${ext}`;
      const disp = res.headers.get("Content-Disposition");
      if (disp) {
        const match = /filename=([^;]+)/i.exec(disp);
        if (match && match[1]) fileName = match[1].replace(/\"/g, "").trim();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Terjadi kesalahan saat mengunduh laporan");
    } finally {
      setExporting(false);
    }
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
          {selectedPeriod === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg text-sm"
              />
              <span className="text-amber-700">s/d</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg text-sm"
              />
            </div>
          )}
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
              {new Date(storeInfo.period.start).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date(storeInfo.period.end).toLocaleDateString("id-ID", {
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
            {new Date(storeInfo.generated_at).toLocaleString("id-ID", {
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
            value: analytics?.sales_overview?.total_orders || 0,
            icon: "🛒",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Total Pendapatan",
            value: formatCurrency(analytics?.sales_overview?.total_revenue || 0),
            icon: "💰",
            color: "from-green-400 to-emerald-500",
            highlight: true,
          },
          {
            label: "Produk Terjual",
            value: analytics?.sales_overview?.total_products_sold || 0,
            icon: "📦",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Total Pembeli",
            value: analytics?.sales_overview?.total_buyers || 0,
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
              value: analytics?.sales_overview?.completed_orders || 0,
              icon: "✅",
              color: "from-green-400 to-emerald-500",
            },
            {
              label: "Dibatalkan",
              value: analytics?.sales_overview?.canceled_orders || 0,
              icon: "❌",
              color: "from-red-400 to-pink-500",
            },
            {
              label: "Dikembalikan",
              value: analytics?.sales_overview?.returned_orders || 0,
              icon: "↩️",
              color: "from-orange-400 to-amber-500",
            },
            {
              label: "Nilai Rata-rata",
              value: formatCurrency(analytics?.sales_overview?.average_order_value || 0),
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
          {(analytics?.sales_trend || []).map((trend: any, idx: number) => {
            const trendData = analytics?.sales_trend || [];
            const maxRevenue = Math.max(1, ...trendData.map((t: any) => (t?.revenue ?? 0)));
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
          {(analytics?.top_products || []).map((product: any, idx: number) => (
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
            {(analytics?.category_performance || []).map((category: any, idx: number) => (
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
                <p className="text-2xl font-bold text-blue-900">{analytics?.payment_summary?.total_transactions || 0}</p>
                <p className="text-xs text-blue-700">Total</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg text-center border-2 border-green-200">
                <p className="text-2xl font-bold text-green-900">{analytics?.payment_summary?.successful_payments || 0}</p>
                <p className="text-xs text-green-700">Berhasil</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg text-center border-2 border-red-200">
                <p className="text-2xl font-bold text-red-900">{analytics?.payment_summary?.failed_payments || 0}</p>
                <p className="text-xs text-red-700">Gagal</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <p className="font-semibold text-amber-900">Metode Pembayaran</p>
              {(analytics?.payment_summary?.payment_methods || []).map((method: any, idx: number) => {
                const percentage = getPercentage(
                  method.transaction_count,
                  (analytics?.payment_summary?.total_transactions || 0)
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
                { label: "Total Pengiriman", value: analytics?.shipping_summary?.total_shipments || 0, icon: "📦" },
                { label: "Terkirim", value: analytics?.shipping_summary?.delivered || 0, icon: "✅" },
                { label: "Dalam Perjalanan", value: analytics?.shipping_summary?.in_transit || 0, icon: "🚚" },
                { label: "Dikembalikan", value: analytics?.shipping_summary?.returned || 0, icon: "↩️" },
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
                {analytics?.shipping_summary?.average_delivery_time_days || 0} <span className="text-lg">hari</span>
              </p>
            </div>
          </div>

          {/* Top Carriers */}
          <div className="space-y-2">
            <p className="font-semibold text-amber-900 mb-3">Kurir Terpopuler</p>
            {(analytics?.shipping_summary?.top_carriers || []).map((carrier: any, idx: number) => (
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
                        width: `${getPercentage(carrier.shipment_count, analytics?.shipping_summary?.total_shipments || 0)}%`,
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
              <p className="text-4xl font-bold text-amber-900">{analytics?.customer_feedback?.average_rating || 0}</p>
              {renderStars(Math.round(analytics?.customer_feedback?.average_rating || 0))}
              <p className="text-sm text-amber-700 mt-1">{analytics?.customer_feedback?.total_reviews || 0} ulasan</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{analytics?.customer_feedback?.positive_reviews || 0}</p>
                <p className="text-xs text-green-700">Positif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{analytics?.customer_feedback?.neutral_reviews || 0}</p>
                <p className="text-xs text-blue-700">Netral</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analytics?.customer_feedback?.negative_reviews || 0}</p>
                <p className="text-xs text-red-700">Negatif</p>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-2">
            <p className="font-semibold text-amber-900 text-sm">Ulasan Terbaru</p>
            {(analytics?.customer_feedback?.recent_reviews || []).map((review: any, idx: number) => (
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
                value: analytics?.financial_report?.gross_revenue || 0,
                color: "from-blue-50 to-cyan-50",
                borderColor: "border-blue-200",
                textColor: "text-blue-900",
              },
              {
                label: "Total Diskon",
                value: -(analytics?.financial_report?.total_discounts || 0),
                color: "from-orange-50 to-amber-50",
                borderColor: "border-orange-200",
                textColor: "text-orange-900",
              },
              {
                label: "Biaya Platform",
                value: -(analytics?.financial_report?.total_fees || 0),
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
              <p className="text-3xl font-bold text-green-900">{formatCurrency(analytics?.financial_report?.net_revenue || 0)}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Estimasi Pencairan</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(analytics?.financial_report?.estimated_payout || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xl">
                  💸
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-2">
                Pencairan terakhir:{" "}
                {new Date(analytics?.financial_report?.last_payout_date || Date.now()).toLocaleDateString("id-ID", {
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
          {(analytics?.activity_log || []).map((activity: any) => (
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
                      onClick={() => setExportFormat(format as any)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-colors border-2 ${
                        exportFormat === format
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-500"
                          : "bg-orange-50 hover:bg-orange-100 border-orange-300 text-amber-900"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Periode</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="last_30_days">30 Hari Terakhir</option>
                  <option value="last_7_days">7 Hari Terakhir</option>
                  <option value="this_month">Bulan Ini</option>
                  <option value="last_month">Bulan Lalu</option>
                  <option value="today">Hari Ini</option>
                  <option value="custom">Custom Range</option>
                </select>
                {selectedPeriod === "custom" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-amber-700 mb-1">Mulai</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-orange-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-amber-700 mb-1">Akhir</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-orange-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  exporting
                    ? "bg-orange-300 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg"
                }`}
              >
                <span>📥</span>
                <span>{exporting ? "Menyiapkan..." : "Unduh Laporan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
