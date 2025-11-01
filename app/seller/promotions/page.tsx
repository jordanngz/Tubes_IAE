"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function PromotionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"promotions" | "coupons">("promotions");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promotionsData, setPromotionsData] = useState<any | null>(null);
  const [couponsData, setCouponsData] = useState<any | null>(null);
  // Form states
  const [promoForm, setPromoForm] = useState<any>({
    name: "",
    description: "",
    type: "percentage",
    value: 10,
    start_at: "",
    end_at: "",
    is_active: true,
    banner: "",
  });
  const [couponForm, setCouponForm] = useState<any>({
    code: "",
    type: "percentage",
    value: 10,
    max_discount: 0,
    min_order_amount: 0,
    start_at: "",
    end_at: "",
    usage_limit: 100,
    per_user_limit: 1,
    is_active: true,
    title: "",
    description: "",
  });

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const [promosRes, couponsRes] = await Promise.all([
          fetch("/api/seller/promotions", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/seller/coupons", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!mounted) return;
        if (promosRes.ok) setPromotionsData(await promosRes.json());
        if (couponsRes.ok) setCouponsData(await couponsRes.json());
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
  }, [user]);

  // compute combined activities early (must be before any conditional returns to keep hooks order stable)
  const combinedActivities = useMemo(() => {
    const acts = [...(promotionsData?.activity_log || []), ...(couponsData?.activity_log || [])];
    return acts
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [promotionsData, couponsData]);

  const togglePromotionActive = async (id: string, nextActive: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: nextActive }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setPromotionsData((prev: any) => ({
        ...prev,
        promotions: (prev?.promotions || []).map((p: any) => (p.id === id ? { ...p, ...updated } : p)),
        promotion_statistics: prev?.promotion_statistics, // keep; can be recomputed later if needed
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const deletePromotion = async (id: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/promotions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      setPromotionsData((prev: any) => ({
        ...prev,
        promotions: (prev?.promotions || []).filter((p: any) => p.id !== id),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      setCouponsData((prev: any) => ({ ...prev, coupons: (prev?.coupons || []).filter((c: any) => c.id !== id) }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCouponActive = async (id: string, nextActive: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: nextActive }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setCouponsData((prev: any) => ({
        ...prev,
        coupons: (prev?.coupons || []).map((c: any) => (c.id === id ? { ...c, ...updated } : c)),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const createPromotion = async () => {
    if (!user) return;
    // simple validation
    if (!promoForm.name || !promoForm.type || !promoForm.value || !promoForm.start_at || !promoForm.end_at) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: promoForm.name,
          description: promoForm.description,
          type: promoForm.type,
          value: Number(promoForm.value),
          start_at: promoForm.start_at,
          end_at: promoForm.end_at,
          is_active: !!promoForm.is_active,
          banner: promoForm.banner || null,
          applied_to: [],
        }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setPromotionsData((prev: any) => ({ ...prev, promotions: [created, ...(prev?.promotions || [])] }));
      setShowCreateForm(false);
      setPromoForm({ name: "", description: "", type: "percentage", value: 10, start_at: "", end_at: "", is_active: true, banner: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const createCoupon = async () => {
    if (!user) return;
    // simple validation
    if (!couponForm.code || !couponForm.type || !couponForm.value || !couponForm.start_at || !couponForm.end_at || !couponForm.title) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: couponForm.code,
          type: couponForm.type,
          value: Number(couponForm.value),
          max_discount: Number(couponForm.max_discount || 0),
          min_order_amount: Number(couponForm.min_order_amount || 0),
          start_at: couponForm.start_at,
          end_at: couponForm.end_at,
          usage_limit: Number(couponForm.usage_limit || 0),
          per_user_limit: Number(couponForm.per_user_limit || 1),
          is_active: !!couponForm.is_active,
          title: couponForm.title,
          description: couponForm.description || "",
        }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setCouponsData((prev: any) => ({ ...prev, coupons: [created, ...(prev?.coupons || [])] }));
      setShowCreateForm(false);
      setCouponForm({
        code: "",
        type: "percentage",
        value: 10,
        max_discount: 0,
        min_order_amount: 0,
        start_at: "",
        end_at: "",
        usage_limit: 100,
        per_user_limit: 1,
        is_active: true,
        title: "",
        description: "",
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg">
        <p className="text-amber-900">Silakan masuk terlebih dahulu.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-1/3 bg-orange-100 rounded-lg animate-pulse" />
        <div className="h-24 w-full bg-orange-50 border-2 border-orange-200 rounded-xl animate-pulse" />
        <div className="h-96 w-full bg-orange-50 border-2 border-orange-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const promoStats = promotionsData?.promotion_statistics || { total_promotions: 0, active_promotions: 0, upcoming_promotions: 0, expired_promotions: 0, total_discount_given: 0 };
  const couponStats = couponsData?.coupon_statistics || { total_coupons: 0, active_coupons: 0, expired_coupons: 0, used_coupons: 0, total_discount_granted: 0 };
  const promotions = promotionsData?.promotions || [];
  const coupons = couponsData?.coupons || [];
  const couponRedemptions = couponsData?.coupon_redemptions || [];

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

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="bg-white/90 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>➕</span>
              <span>Buat {activeTab === "promotions" ? "Promosi" : "Kupon"} Baru</span>
            </h2>
            <button onClick={() => setShowCreateForm(false)} className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {activeTab === "promotions" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-amber-900">Nama Promosi</label>
                <input value={promoForm.name} onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Tipe Diskon</label>
                <select value={promoForm.type} onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Nilai Diskon</label>
                <input type="number" value={promoForm.value} onChange={(e) => setPromoForm({ ...promoForm, value: Number(e.target.value) })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Aktif?</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={promoForm.is_active} onChange={(e) => setPromoForm({ ...promoForm, is_active: e.target.checked })} />
                  <span className="text-sm text-amber-800">Promosi aktif</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Mulai</label>
                <input type="datetime-local" value={promoForm.start_at} onChange={(e) => setPromoForm({ ...promoForm, start_at: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Berakhir</label>
                <input type="datetime-local" value={promoForm.end_at} onChange={(e) => setPromoForm({ ...promoForm, end_at: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-amber-900">Deskripsi</label>
                <textarea value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-amber-900">Banner (opsional)</label>
                <input value={promoForm.banner} onChange={(e) => setPromoForm({ ...promoForm, banner: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors">Batal</button>
                <button onClick={createPromotion} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">Simpan Promosi</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-amber-900">Kode Kupon</label>
                <input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Tipe Diskon</label>
                <select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Nilai Diskon</label>
                <input type="number" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Max Diskon</label>
                <input type="number" value={couponForm.max_discount} onChange={(e) => setCouponForm({ ...couponForm, max_discount: Number(e.target.value) })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Min. Belanja</label>
                <input type="number" value={couponForm.min_order_amount} onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: Number(e.target.value) })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Batas Pemakaian</label>
                <input type="number" value={couponForm.usage_limit} onChange={(e) => setCouponForm({ ...couponForm, usage_limit: Number(e.target.value) })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Batas / Pengguna</label>
                <input type="number" value={couponForm.per_user_limit} onChange={(e) => setCouponForm({ ...couponForm, per_user_limit: Number(e.target.value) })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Aktif?</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={couponForm.is_active} onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })} />
                  <span className="text-sm text-amber-800">Kupon aktif</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Mulai</label>
                <input type="datetime-local" value={couponForm.start_at} onChange={(e) => setCouponForm({ ...couponForm, start_at: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900">Berakhir</label>
                <input type="datetime-local" value={couponForm.end_at} onChange={(e) => setCouponForm({ ...couponForm, end_at: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-amber-900">Judul</label>
                <input value={couponForm.title} onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-amber-900">Deskripsi</label>
                <textarea value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} className="w-full px-3 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg"></textarea>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors">Batal</button>
                <button onClick={createCoupon} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">Simpan Kupon</button>
              </div>
            </div>
          )}
        </div>
      )}

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
            {promoStats.active_promotions}
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
            {couponStats.active_coupons}
          </span>
        </button>
      </div>

      {/* Statistics Cards */}
      {activeTab === "promotions" ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
          {[
            {
              label: "Total Promosi",
              value: promoStats.total_promotions,
              icon: "🎯",
              color: "from-blue-400 to-cyan-500",
            },
            {
              label: "Aktif",
              value: promoStats.active_promotions,
              icon: "✅",
              color: "from-green-400 to-emerald-500",
            },
            {
              label: "Akan Datang",
              value: promoStats.upcoming_promotions,
              icon: "⏰",
              color: "from-blue-400 to-indigo-500",
            },
            {
              label: "Kadaluarsa",
              value: promoStats.expired_promotions,
              icon: "⏱️",
              color: "from-red-400 to-pink-500",
            },
            {
              label: "Total Diskon Diberikan",
              value: formatCurrency(promoStats.total_discount_given),
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
              value: couponStats.total_coupons,
              icon: "🎫",
              color: "from-purple-400 to-pink-500",
            },
            {
              label: "Aktif",
              value: couponStats.active_coupons,
              icon: "✅",
              color: "from-green-400 to-emerald-500",
            },
            {
              label: "Kadaluarsa",
              value: couponStats.expired_coupons,
              icon: "⏱️",
              color: "from-red-400 to-pink-500",
            },
            {
              label: "Terpakai",
              value: couponStats.used_coupons,
              icon: "✨",
              color: "from-blue-400 to-indigo-500",
            },
            {
              label: "Total Diskon",
              value: formatCurrency(couponStats.total_discount_granted),
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
          {promotions.map((promo: any, idx: number) => {
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
                      {promo.applied_to.map((item: any, itemIdx: number) => (
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
                      <button onClick={() => togglePromotionActive(promo.id, false)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-2">
                        <span>⏸️</span>
                        <span>Nonaktifkan</span>
                      </button>
                    ) : (
                      <button onClick={() => togglePromotionActive(promo.id, true)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition-colors flex items-center gap-2">
                        <span>▶️</span>
                        <span>Aktifkan</span>
                      </button>
                    )}
                    <button onClick={() => deletePromotion(promo.id)} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
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
            {coupons.map((coupon: any, idx: number) => {
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCouponActive(coupon.id, !coupon.is_active)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${coupon.is_active ? "bg-white text-purple-600" : "bg-white/70 text-purple-800"}`}
                          >
                            {coupon.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <span className="text-4xl">🎫</span>
                        </div>
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
                      <button onClick={() => deleteCoupon(coupon.id)} className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center justify-center gap-2">
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
              {couponRedemptions.map((redemption: any, idx: number) => (
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
          {combinedActivities.map((activity: any) => (
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
