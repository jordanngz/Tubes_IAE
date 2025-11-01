"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ShipmentManagementPage() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [showCourierSettings, setShowCourierSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shipmentData, setShipmentData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch("/api/seller/shipments", { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        if (!res.ok) {
          setShipmentData(null);
        } else {
          const data = await res.json();
          setShipmentData(data);
        }
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

  const filteredShipments = useMemo(() => {
    const list: any[] = shipmentData?.shipments || [];
    const q = searchQuery.trim().toLowerCase();
    let items = list.filter((s) =>
      !q
        ? true
        : s.tracking_number?.toLowerCase().includes(q) || s.order_number?.toLowerCase().includes(q)
    );
    if (filterStatus !== "all") items = items.filter((s) => s.status === filterStatus);
    return items;
  }, [shipmentData, searchQuery, filterStatus]);

  const updateShipment = async (id: string, payload: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setShipmentData((prev: any) => ({
        ...prev,
        shipments: (prev?.shipments || []).map((s: any) => (s.id === id ? { ...s, ...updated } : s)),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const markInTransit = (id: string) => updateShipment(id, { status: "in_transit", add_event: { status: "in_transit" } });
  const markDelivered = (id: string) => updateShipment(id, { status: "delivered", add_event: { status: "delivered" } });
  const markReturned = (id: string) => updateShipment(id, { status: "returned", add_event: { status: "returned" } });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      created: "bg-gray-100 text-gray-700 border-gray-300",
      picked_up: "bg-blue-100 text-blue-700 border-blue-300",
      in_transit: "bg-purple-100 text-purple-700 border-purple-300",
      delivered: "bg-green-100 text-green-700 border-green-300",
      failed: "bg-red-100 text-red-700 border-red-300",
      returned: "bg-orange-100 text-orange-700 border-orange-300",
    };
    return styles[status] || styles.created;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      created: "📋",
      picked_up: "📦",
      in_transit: "🚚",
      delivered: "✅",
      failed: "❌",
      returned: "↩️",
    };
    return icons[status] || "📦";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      created: "Dibuat",
      picked_up: "Diambil",
      in_transit: "Dalam Perjalanan",
      delivered: "Terkirim",
      failed: "Gagal",
      returned: "Dikembalikan",
    };
    return labels[status] || status;
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

  if (!shipmentData) {
    return (
      <div className="p-6 bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg">
        <p className="text-amber-900">Data pengiriman tidak tersedia. Pastikan toko telah dibuat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🚚</span>
            <span>Manajemen Pengiriman</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola dan pantau status pengiriman pesanan pelanggan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCourierSettings(!showCourierSettings)}
            className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Pengaturan Kurir</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2">
            <span>➕</span>
            <span>Buat Pengiriman</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
        {[
          {
            label: "Total Pengiriman",
            value: shipmentData.shipment_summary.total_shipments,
            icon: "📦",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Dibuat",
            value: shipmentData.shipment_summary.created,
            icon: "📋",
            color: "from-gray-400 to-slate-500",
          },
          {
            label: "Diambil",
            value: shipmentData.shipment_summary.picked_up,
            icon: "📦",
            color: "from-blue-400 to-indigo-500",
          },
          {
            label: "Dalam Perjalanan",
            value: shipmentData.shipment_summary.in_transit,
            icon: "🚚",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Terkirim",
            value: shipmentData.shipment_summary.delivered,
            icon: "✅",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Gagal",
            value: shipmentData.shipment_summary.failed,
            icon: "❌",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Dikembalikan",
            value: shipmentData.shipment_summary.returned,
            icon: "↩️",
            color: "from-orange-400 to-amber-500",
          },
          {
            label: "Biaya Pengiriman",
            value: formatCurrency(shipmentData.shipment_summary.total_shipping_cost),
            icon: "💰",
            color: "from-green-400 to-teal-500",
            isLarge: true,
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105`}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <p
                className={`font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                  stat.isLarge ? "text-lg" : "text-2xl"
                }`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-amber-700 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courier Settings Modal */}
      {showCourierSettings && (
        <div className="bg-white/90 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>⚙️</span>
              <span>Pengaturan Kurir</span>
            </h2>
            <button
              onClick={() => setShowCourierSettings(false)}
              className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Auto Sync */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="font-semibold text-amber-900">Auto-Sync dengan API Kurir</p>
                <p className="text-sm text-amber-700">Sinkronisasi otomatis status pengiriman setiap 30 menit</p>
                <p className="text-xs text-amber-600 mt-1">
                  Terakhir sync: {new Date(shipmentData.courier_settings.last_sync_at).toLocaleString("id-ID")}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={shipmentData.courier_settings.auto_sync_with_api} className="sr-only peer" readOnly />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
              </label>
            </div>

            {/* Default Carrier */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="font-semibold text-amber-900 mb-3">Kurir Default</p>
              <select 
                className="w-full px-4 py-2 bg-white border-2 border-orange-200 rounded-lg text-amber-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                defaultValue={shipmentData.courier_settings.default_carrier}
              >
                {shipmentData.courier_settings.available_carriers
                  .filter((c: any) => c.is_active)
                  .map((carrier: any) => (
                    <option key={carrier.name} value={carrier.name}>
                      {carrier.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Available Carriers */}
            <div>
              <p className="font-semibold text-amber-900 mb-3">Kurir yang Tersedia</p>
              <div className="space-y-2">
                {shipmentData.courier_settings.available_carriers.map((carrier: any) => (
                  <div
                    key={carrier.name}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {carrier.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-amber-900">{carrier.name}</p>
                          <div className="flex gap-1 mt-1">
                            {carrier.services.map((service: any) => (
                              <span
                                key={service}
                                className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs font-medium"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={carrier.is_active} className="sr-only peer" readOnly />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                💾 Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Overview */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Tracking Overview</h2>
        </div>

        <div className="space-y-3">
          {shipmentData.tracking_overview.map((tracking: any, idx: number) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl shadow-md">
                    {getStatusIcon(tracking.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-amber-900">{tracking.tracking_number}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(tracking.status)}`}>
                        {getStatusLabel(tracking.status)}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">📍 {tracking.current_location}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Update terakhir: {new Date(tracking.last_update).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full md:w-48">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-amber-700 font-medium">Progress</p>
                    <p className="text-xs font-bold text-amber-900">{tracking.progress_percent}%</p>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${tracking.progress_percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="search"
                placeholder="Cari pengiriman berdasarkan nomor resi atau pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-orange-50 border-2 border-orange-200 text-sm text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "Semua", icon: "📦" },
              { id: "created", label: "Dibuat", icon: "📋" },
              { id: "picked_up", label: "Diambil", icon: "📦" },
              { id: "in_transit", label: "Perjalanan", icon: "🚚" },
              { id: "delivered", label: "Terkirim", icon: "✅" },
              { id: "returned", label: "Dikembalikan", icon: "↩️" },
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
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-4 animate-fade-in">
        {filteredShipments.map((shipment: any, idx: number) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Shipment Header */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 border-b-2 border-orange-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    {getStatusIcon(shipment.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-amber-900">{shipment.tracking_number}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(shipment.status)}`}>
                        {getStatusLabel(shipment.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border-2 border-blue-300">
                        {shipment.carrier_name} {shipment.service_code}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      Pesanan: <strong>{shipment.order_number}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatCurrency(shipment.cost)}
                  </p>
                  <p className="text-xs text-amber-700">Biaya Pengiriman</p>
                </div>
              </div>
            </div>

            {/* Shipment Content */}
            <div className="p-4 space-y-4">
              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From */}
                <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📤</span>
                    <p className="font-bold text-amber-900">Dari</p>
                  </div>
                  <div className="space-y-1 text-sm text-amber-800">
                    <p>
                      <strong>{shipment.address_from?.store_name}</strong>
                    </p>
                    <p>{shipment.address_from?.address_line1}</p>
                    <p>
                      {shipment.address_from?.city}, {shipment.address_from?.state} {shipment.address_from?.postal_code}
                    </p>
                  </div>
                </div>

                {/* To */}
                <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📥</span>
                    <p className="font-bold text-amber-900">Kepada</p>
                  </div>
                  <div className="space-y-1 text-sm text-amber-800">
                    <p>
                      <strong>{shipment.address_to?.recipient_name}</strong>
                    </p>
                    <p>{shipment.buyer_contact}</p>
                    <p>{shipment.address_to?.address_line1}</p>
                    <p>
                      {shipment.address_to?.city}, {shipment.address_to?.state} {shipment.address_to?.postal_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipment Timeline */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🚚</span>
                  <p className="font-bold text-blue-900">Timeline Pengiriman</p>
                </div>

                <div className="space-y-3">
                  {Array.isArray(shipment.events) && shipment.events.map((event: any, eventIdx: number) => (
                    <div key={event.event_id || eventIdx} className="flex items-start gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white flex items-center justify-center text-lg font-bold shadow-md z-10">
                          {getStatusIcon(event.status)}
                        </div>
                        {eventIdx < shipment.events.length - 1 && (
                          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-cyan-300 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-blue-900">{event.description}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadge(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">📍 {event.location}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(event.occurred_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Estimated Delivery */}
                {shipment.estimated_delivery && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg border-2 border-blue-300">
                    <p className="font-bold text-blue-900 mb-1">📅 Estimasi Tiba</p>
                    <p className="text-sm text-blue-800">
                      {new Date(shipment.estimated_delivery.min_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      -{" "}
                      {new Date(shipment.estimated_delivery.max_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {(shipment.notes?.buyer_notes || shipment.notes?.seller_notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shipment.notes?.buyer_notes && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
                        <span>📝</span>
                        <span>Catatan Pembeli</span>
                      </p>
                      <p className="text-sm text-amber-800">{shipment.notes?.buyer_notes}</p>
                    </div>
                  )}
                  {shipment.notes?.seller_notes && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
                        <span>📝</span>
                        <span>Catatan Seller</span>
                      </p>
                      <p className="text-sm text-amber-800">{shipment.notes?.seller_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-200">
                <button onClick={() => markInTransit(shipment.id)} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <span>🔄</span>
                    <span>Update Status</span>
                  </button>
                {shipment.status !== "delivered" && shipment.status !== "returned" && (
                  <button onClick={() => markDelivered(shipment.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors flex items-center gap-2">
                    <span>✅</span>
                    <span>Tandai Terkirim</span>
                  </button>
                )}
                {shipment.status !== "delivered" && shipment.status !== "returned" && (
                  <button onClick={() => markReturned(shipment.id)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <span>↩️</span>
                    <span>Tandai Dikembalikan</span>
                  </button>
                )}
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2">
                    <span>🖨️</span>
                    <span>Cetak Label</span>
                  </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <span>📋</span>
                  <span>Detail Pesanan</span>
                </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <span>💬</span>
                  <span>Chat Pembeli</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Pengiriman Terbaru</h2>
        </div>

        <div className="space-y-3">
          {shipmentData.activity_log.map((activity: any) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold shrink-0">
                {activity.type === "create_shipment"
                  ? "➕"
                  : activity.type === "update_tracking"
                  ? "🔄"
                  : activity.type === "mark_delivered"
                  ? "✅"
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
