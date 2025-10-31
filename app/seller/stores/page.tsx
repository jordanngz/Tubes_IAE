"use client";

import { useState } from "react";
import Link from "next/link";

// Store data placeholder
const storeData = {
  store_profile: {
    id: null,
    owner_id: null,
    name: "Nama Toko Placeholder",
    slug: "nama-toko-placeholder",
    description: "Deskripsi singkat mengenai toko makanan kaleng Anda.",
    logo: "/images/store/logo-placeholder.png",
    banner: "/images/store/banner-placeholder.jpg",
    status: "pending",
    verified_at: null,
    rating_avg: 0.0,
    rating_count: 0,
    policies: {
      return_policy: "Belum diatur",
      shipping_policy: "Belum diatur",
      privacy_policy: "Belum diatur",
    },
    contact_email: "email@tokoanda.com",
    contact_phone: "+62-812-0000-0000",
    is_active: true,
    created_at: null,
    updated_at: null,
  },
  store_address: {
    id: null,
    label: "Alamat Utama",
    recipient_name: "Nama Pemilik Toko",
    phone: "+62-812-0000-0000",
    address_line1: "Jalan Contoh No.123",
    address_line2: "Kecamatan Placeholder",
    city: "Kota Placeholder",
    state: "Provinsi Placeholder",
    postal_code: "12345",
    country: "ID",
    latitude: -6.2,
    longitude: 106.8166667,
    is_default: true,
  },
  store_operational_settings: {
    open_status: "open",
    open_hours: {
      monday: "08:00 - 20:00",
      tuesday: "08:00 - 20:00",
      wednesday: "08:00 - 20:00",
      thursday: "08:00 - 20:00",
      friday: "08:00 - 20:00",
      saturday: "09:00 - 18:00",
      sunday: "closed",
    },
    delivery_options: [
      {
        carrier_name: "JNE",
        service_code: "REG",
        estimated_days: "2-3",
        active: true,
      },
      {
        carrier_name: "POS Indonesia",
        service_code: "Kilat",
        estimated_days: "3-5",
        active: false,
      },
    ],
  },
  store_verification: {
    application_id: null,
    status: "submitted",
    proposed_name: "Nama Toko Placeholder",
    description: "Menjual berbagai makanan kaleng berkualitas.",
    documents: [
      {
        type: "KTP",
        file_url: "/uploads/documents/ktp-placeholder.jpg",
      },
      {
        type: "NPWP",
        file_url: "/uploads/documents/npwp-placeholder.jpg",
      },
    ],
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
  },
  store_policy_templates: [
    {
      type: "return_policy",
      title: "Kebijakan Pengembalian Barang",
      content: "Barang dapat dikembalikan dalam waktu 7 hari setelah diterima.",
    },
    {
      type: "shipping_policy",
      title: "Kebijakan Pengiriman",
      content: "Pesanan diproses dalam waktu 1x24 jam dan dikirim melalui kurir pilihan Anda.",
    },
    {
      type: "privacy_policy",
      title: "Kebijakan Privasi",
      content: "Kami menjaga kerahasiaan data pembeli sesuai dengan peraturan yang berlaku.",
    },
  ],
  store_activity_log: [
    {
      id: 1,
      type: "update_store_profile",
      description: "Penjual memperbarui deskripsi toko.",
      timestamp: "2025-11-01T00:00:00Z",
    },
    {
      id: 2,
      type: "update_store_status",
      description: "Toko diubah menjadi status 'open'.",
      timestamp: "2025-11-01T00:10:00Z",
    },
  ],
};

export default function StoreManagementPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "operational" | "verification" | "policies">("profile");
  const [isEditMode, setIsEditMode] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      submitted: "bg-blue-100 text-blue-700 border-blue-300",
      approved: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
      open: "bg-green-100 text-green-700 border-green-300",
      closed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getDayIcon = (day: string) => {
    const hours = storeData.store_operational_settings.open_hours[day as keyof typeof storeData.store_operational_settings.open_hours];
    return hours === "closed" ? "🔒" : "✅";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🏪</span>
            <span>Manajemen Toko</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola profil, alamat, jam operasional, dan kebijakan toko Anda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              isEditMode
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md hover:shadow-xl"
                : "bg-white border-2 border-orange-300 text-amber-900 hover:bg-orange-50"
            }`}
          >
            <span>{isEditMode ? "💾" : "✏️"}</span>
            <span>{isEditMode ? "Simpan" : "Edit Toko"}</span>
          </button>
        </div>
      </div>

      {/* Store Status Banner */}
      <div className="bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl shadow-lg">
            {storeData.store_operational_settings.open_status === "open" ? "🟢" : "🔴"}
          </div>
          <div>
            <p className="font-bold text-amber-900">Status Toko</p>
            <p className="text-sm text-amber-700">
              Toko Anda saat ini{" "}
              <span className="font-semibold">
                {storeData.store_operational_settings.open_status === "open" ? "Buka" : "Tutup"}
              </span>
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white rounded-lg font-semibold text-sm text-amber-900 border-2 border-orange-300 hover:bg-orange-50 transition-all duration-300 hover:scale-105">
          Toggle Status
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto">
        {[
          { id: "profile", label: "Profil Toko", icon: "🏪" },
          { id: "operational", label: "Operasional", icon: "⏰" },
          { id: "verification", label: "Verifikasi", icon: "✅" },
          { id: "policies", label: "Kebijakan", icon: "📜" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                : "text-amber-900 hover:bg-orange-50"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Profile Card */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏪</span>
                <h2 className="text-xl font-bold text-amber-900">Profil Toko</h2>
              </div>

              {/* Logo & Banner */}
              <div className="space-y-3">
                <div className="aspect-[3/1] bg-gradient-to-r from-orange-200 to-amber-200 rounded-lg flex items-center justify-center border-2 border-dashed border-orange-300">
                  <span className="text-4xl">🖼️</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-3xl shadow-lg border-4 border-white">
                    🏪
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">{storeData.store_profile.name}</p>
                    <p className="text-sm text-amber-700">@{storeData.store_profile.slug}</p>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">📝</span>
                  <span className="text-amber-700">{storeData.store_profile.description}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">📧</span>
                  <span className="text-amber-700">{storeData.store_profile.contact_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-lg">📞</span>
                  <span className="text-amber-700">{storeData.store_profile.contact_phone}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 pt-3 border-t border-orange-200">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(
                    storeData.store_profile.status
                  )}`}
                >
                  {storeData.store_profile.status.toUpperCase()}
                </span>
                <span className="text-xs text-amber-700">⭐ {storeData.store_profile.rating_avg.toFixed(1)} ({storeData.store_profile.rating_count} ulasan)</span>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📍</span>
                <h2 className="text-xl font-bold text-amber-900">Alamat Toko</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">🏷️</span>
                  <div>
                    <p className="font-semibold text-amber-900">{storeData.store_address.label}</p>
                    <p className="text-sm text-amber-700">{storeData.store_address.recipient_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">📞</span>
                  <p className="text-sm text-amber-700">{storeData.store_address.phone}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">🏠</span>
                  <div className="text-sm text-amber-700">
                    <p>{storeData.store_address.address_line1}</p>
                    <p>{storeData.store_address.address_line2}</p>
                    <p>
                      {storeData.store_address.city}, {storeData.store_address.state}
                    </p>
                    <p>{storeData.store_address.postal_code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-orange-200">
                  <span className="text-lg">🗺️</span>
                  <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                    Lihat di Peta →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operational Tab */}
        {activeTab === "operational" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Hours */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⏰</span>
                <h2 className="text-xl font-bold text-amber-900">Jam Operasional</h2>
              </div>

              <div className="space-y-2">
                {Object.entries(storeData.store_operational_settings.open_hours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getDayIcon(day)}</span>
                      <span className="font-semibold text-amber-900 capitalize">{day}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        hours === "closed" ? "text-gray-500" : "text-green-700"
                      }`}
                    >
                      {hours === "closed" ? "Tutup" : hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🚚</span>
                <h2 className="text-xl font-bold text-amber-900">Opsi Pengiriman</h2>
              </div>

              <div className="space-y-3">
                {storeData.store_operational_settings.delivery_options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      option.active
                        ? "bg-green-50 border-green-300 shadow-md"
                        : "bg-gray-50 border-gray-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.active ? "✅" : "⭕"}</span>
                        <div>
                          <p className="font-bold text-amber-900">{option.carrier_name}</p>
                          <p className="text-xs text-amber-700">{option.service_code}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={option.active} className="sr-only peer" readOnly />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-amber-700">
                      Estimasi: <span className="font-semibold">{option.estimated_days} hari</span>
                    </p>
                  </div>
                ))}

                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                  + Tambah Kurir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === "verification" && (
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <h2 className="text-xl font-bold text-amber-900">Status Verifikasi Toko</h2>
            </div>

            {/* Verification Status */}
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-3xl shadow-lg">
                  📋
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-900 text-lg">Verifikasi {storeData.store_verification.status}</p>
                  <p className="text-sm text-blue-700">{storeData.store_verification.proposed_name}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusBadge(
                    storeData.store_verification.status
                  )}`}
                >
                  {storeData.store_verification.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-blue-800">{storeData.store_verification.description}</p>
            </div>

            {/* Documents */}
            <div>
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <span>📄</span>
                <span>Dokumen yang Diunggah</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeData.store_verification.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">📎</span>
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900">{doc.type}</p>
                        <p className="text-xs text-amber-700 truncate">{doc.file_url}</p>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                      Lihat Dokumen →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              Upload Dokumen Tambahan
            </button>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === "policies" && (
          <div className="space-y-4">
            {storeData.store_policy_templates.map((policy, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📜</span>
                    <h2 className="text-xl font-bold text-amber-900">{policy.title}</h2>
                  </div>
                  <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-200 transition-colors">
                    Edit
                  </button>
                </div>
                <p className="text-amber-800 leading-relaxed">{policy.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Terbaru</h2>
        </div>

        <div className="space-y-3">
          {storeData.store_activity_log.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold shrink-0">
                {activity.id}
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
              <span className="text-lg">✅</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
