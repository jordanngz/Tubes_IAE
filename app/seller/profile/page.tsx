"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

// Profile & Account data placeholder (used as initial state)
const initialProfileData = {
  user_info: {
    user_id: null,
    email: "seller@example.com",
    username: "sellerplaceholder",
    role: "seller",
    status: "active",
    created_at: "2025-10-01T00:00:00Z",
    last_login_at: "2025-11-01T08:00:00Z",
  },
  profile: {
    profile_id: null,
    full_name: "Nama Penjual Placeholder",
    photo_url: "/images/users/profile-placeholder.jpg",
    gender: "not_specified",
    phone_number: "+62-812-0000-0000",
    bio: "Menjual berbagai produk makanan kaleng berkualitas tinggi.",
    birth_date: null,
    created_at: "2025-10-01T00:00:00Z",
    updated_at: "2025-10-25T00:00:00Z",
  },
  store_association: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    store_logo: "/images/store/logo-placeholder.png",
    store_banner: "/images/store/banner-placeholder.jpg",
    store_status: "approved",
    joined_at: "2025-10-02T00:00:00Z",
  },
  address_book: [
    {
      address_id: 1,
      label: "Alamat Utama",
      recipient_name: "Nama Penjual Placeholder",
      phone: "+62-812-0000-0000",
      address_line1: "Jl. Raya Kaleng No. 45",
      address_line2: "Kecamatan Placeholder",
      city: "Bandung",
      state: "Jawa Barat",
      postal_code: "40211",
      country: "ID",
      is_default: true,
      created_at: "2025-10-01T00:00:00Z",
    },
    {
      address_id: 2,
      label: "Alamat Gudang",
      recipient_name: "Nama Penjual Placeholder",
      phone: "+62-812-0000-0000",
      address_line1: "Jl. Industri No. 12",
      address_line2: "Kawasan Pergudangan Placeholder",
      city: "Bandung",
      state: "Jawa Barat",
      postal_code: "40212",
      country: "ID",
      is_default: false,
      created_at: "2025-10-01T00:00:00Z",
    },
  ],
  account_settings: {
    language: "id",
    timezone: "Asia/Jakarta",
    currency: "IDR",
    dark_mode: false,
    two_factor_auth: false,
    email_verified: true,
    phone_verified: true,
    notification_preferences: {
      order_updates: true,
      product_reviews: true,
      system_alerts: true,
      marketing_emails: false,
    },
    last_updated: "2025-10-30T10:00:00Z",
  },
  security_settings: {
    password_last_changed: "2025-09-30T00:00:00Z",
    two_factor_enabled: false,
    login_devices: [
      {
        device_id: 1,
        device_name: "Chrome - Windows 10",
        ip_address: "192.168.1.10",
        location: "Bandung, Indonesia",
        last_login: "2025-11-01T08:00:00Z",
        is_current_device: true,
      },
      {
        device_id: 2,
        device_name: "Chrome - Android",
        ip_address: "192.168.2.20",
        location: "Jakarta, Indonesia",
        last_login: "2025-10-31T14:00:00Z",
        is_current_device: false,
      },
    ],
    login_history: [
      {
        login_id: 1,
        timestamp: "2025-11-01T08:00:00Z",
        ip_address: "192.168.1.10",
        location: "Bandung, Indonesia",
        device: "Chrome - Windows 10",
      },
      {
        login_id: 2,
        timestamp: "2025-10-31T14:00:00Z",
        ip_address: "192.168.2.20",
        location: "Jakarta, Indonesia",
        device: "Chrome - Android",
      },
    ],
  },
  activity_log: [
    {
      id: 1,
      type: "update_profile",
      description: "Penjual memperbarui foto profil dan nomor telepon.",
      timestamp: "2025-10-25T09:00:00Z",
    },
    {
      id: 2,
      type: "change_password",
      description: "Penjual mengganti kata sandi akunnya.",
      timestamp: "2025-10-30T10:00:00Z",
    },
    {
      id: 3,
      type: "login",
      description: "Penjual berhasil login ke akun.",
      timestamp: "2025-11-01T08:00:00Z",
    },
  ],
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(initialProfileData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "security" | "addresses">("profile");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone_number: "",
    bio: "",
  });

  const openEditProfile = () => {
    setEditForm({
      full_name: profileData.profile.full_name || "",
      username: profileData.user_info.username || "",
      email: profileData.user_info.email || "",
      phone_number: profileData.profile.phone_number || "",
      bio: profileData.profile.bio || "",
    });
    setShowEditProfile(true);
  };

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setLoadError(null);
      const data = await authFetch("/api/seller/profile");
      setProfileData({
        user_info: data.user_info || initialProfileData.user_info,
        profile: data.profile || initialProfileData.profile,
        store_association: data.store_association || initialProfileData.store_association,
        account_settings: data.account_settings || initialProfileData.account_settings,
        security_settings: data.security_settings || initialProfileData.security_settings,
        address_book: data.address_book || initialProfileData.address_book,
        activity_log: data.activity_log || initialProfileData.activity_log,
      });
    } catch (e) {
      console.error("load profile error", e);
      setLoadError(e instanceof Error ? e.message : "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      // Optimistic update
      setProfileData((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          full_name: editForm.full_name,
          phone_number: editForm.phone_number,
          bio: editForm.bio,
        },
        user_info: {
          ...prev.user_info,
          username: editForm.username,
          // email update may require Firebase Auth; skip server update for email here
        },
      }));
      await authFetch("/api/seller/profile", {
        method: "PATCH",
        body: JSON.stringify({
          username: editForm.username,
          profile: {
            full_name: editForm.full_name,
            phone_number: editForm.phone_number,
            bio: editForm.bio,
          },
        }),
      });
      setShowEditProfile(false);
    } catch (e) {
      console.error("save profile error", e);
    }
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const idToken = user ? await user.getIdToken() : "";
    const hasBody = !!init?.body;
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${idToken}`,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      let msg = `${res.status}`;
      try {
        const text = await res.text();
        msg = text;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  };

  useEffect(() => {
    let isMounted = true;
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        await loadProfile();
        if (!isMounted) return;
      } catch (e) {
        console.error("load profile error", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      update_profile: "✏️",
      change_password: "🔐",
      login: "🔓",
      logout: "🚪",
      update_settings: "⚙️",
    };
    return icons[type] || "📦";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    return `${Math.floor(diffDays / 30)} bulan yang lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>👤</span>
            <span>Profil & Akun</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola informasi profil dan pengaturan akun Anda</p>
        </div>
      </div>

      {/* Profile Card Header */}
      {loadError && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">Gagal memuat data profil.</span>
              <span className="text-sm opacity-80 break-all">{String(loadError)}</span>
            </div>
            <button
              onClick={loadProfile}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
        <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 opacity-50"></div>
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-5xl font-bold">
                  {(profileData.profile?.full_name?.[0] ?? profileData.user_info?.username?.[0] ?? "U").toUpperCase()}
                </div>
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors">
                📷
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left text-white mb-4">
              <h2 className="text-2xl font-bold mb-1">{profileData.profile.full_name}</h2>
              <p className="text-orange-100 text-sm mb-2">@{profileData.user_info.username}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span>📧</span>
                  <span>{profileData.user_info.email}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span>📱</span>
                  <span>{profileData.profile.phone_number}</span>
                </span>
                <span className="flex items-center gap-1 bg-green-400 px-3 py-1 rounded-full font-bold">
                  <span>✓</span>
                  <span>{((profileData.user_info?.status ?? "active") + "").toUpperCase()}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={openEditProfile}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
              >
                <span>✏️</span>
                <span>Edit Profil</span>
              </button>
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors">
                🏪 Lihat Toko
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Association Card */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl shadow-lg p-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-3xl shadow-md">
            🏪
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-1">{profileData.store_association.store_name}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-blue-700">
                <span>📅</span>
                <span>Bergabung {new Date(profileData.store_association.joined_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold border border-green-300">
                ✓ {((profileData.store_association?.store_status ?? "approved") + "").toUpperCase()}
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
            Kelola Toko →
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto animate-fade-in">
        {[
          { id: "profile", label: "Profil", icon: "👤" },
          { id: "account", label: "Pengaturan Akun", icon: "⚙️" },
          { id: "security", label: "Keamanan", icon: "🔐" },
          { id: "addresses", label: "Alamat", icon: "📍" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                : "text-amber-900 hover:bg-orange-50"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile Information */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <span>📝</span>
                <span>Informasi Profil</span>
              </h3>
              <button
                onClick={openEditProfile}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
              >
                ✏️ Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Nama Lengkap</label>
                <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900">
                  {profileData.profile.full_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Username</label>
                <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900">
                  @{profileData.user_info.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Email</label>
                <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900 flex items-center justify-between">
                  <span>{profileData.user_info.email}</span>
                  {profileData.account_settings.email_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Terverifikasi</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Nomor Telepon</label>
                <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900 flex items-center justify-between">
                  <span>{profileData.profile.phone_number}</span>
                  {profileData.account_settings.phone_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Terverifikasi</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-amber-700 mb-2">Bio</label>
                <div className="px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg text-amber-900">
                  {profileData.profile.bio}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-4">
              <span>📊</span>
              <span>Aktivitas Terakhir</span>
            </h3>

            <div className="space-y-3">
              {profileData.activity_log.map((activity: any) => (
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
      )}

      {activeTab === "account" && (
        <div className="space-y-6 animate-fade-in">
          {/* Account Settings */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-6">
              <span>⚙️</span>
              <span>Pengaturan Akun</span>
            </h3>

            <div className="space-y-4">
              {[
                { id: "language", label: "Bahasa", value: "Indonesia", icon: "🌐" },
                { id: "timezone", label: "Zona Waktu", value: profileData.account_settings.timezone, icon: "🕐" },
                { id: "currency", label: "Mata Uang", value: profileData.account_settings.currency, icon: "💰" },
              ].map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{setting.icon}</span>
                    <div>
                      <p className="font-semibold text-amber-900">{setting.label}</p>
                      <p className="text-sm text-amber-700">{setting.value}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors">
                    Ubah
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌙</span>
                  <div>
                    <p className="font-semibold text-amber-900">Dark Mode</p>
                    <p className="text-sm text-amber-700">Tampilan gelap untuk mata</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!profileData.account_settings.dark_mode}
                    onChange={async (e) => {
                      const next = e.target.checked;
                      // Optimistic
                      setProfileData((prev: any) => ({
                        ...prev,
                        account_settings: { ...prev.account_settings, dark_mode: next },
                      }));
                      try {
                        await authFetch("/api/seller/profile/settings", {
                          method: "PATCH",
                          body: JSON.stringify({ dark_mode: next }),
                        });
                      } catch (err) {
                        console.error("toggle dark_mode error", err);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-6">
              <span>🔔</span>
              <span>Preferensi Notifikasi</span>
            </h3>

            <div className="space-y-3">
              {[
                { id: "order_updates", label: "Pembaruan Pesanan", enabled: profileData.account_settings.notification_preferences.order_updates },
                { id: "product_reviews", label: "Ulasan Produk", enabled: profileData.account_settings.notification_preferences.product_reviews },
                { id: "system_alerts", label: "Alert Sistem", enabled: profileData.account_settings.notification_preferences.system_alerts },
                { id: "marketing_emails", label: "Email Marketing", enabled: profileData.account_settings.notification_preferences.marketing_emails },
              ].map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <span className="font-semibold text-amber-900">{pref.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!pref.enabled}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        // Optimistic local update
                        setProfileData((prev: any) => ({
                          ...prev,
                          account_settings: {
                            ...prev.account_settings,
                            notification_preferences: {
                              ...prev.account_settings.notification_preferences,
                              [pref.id]: checked,
                            },
                          },
                        }));
                        try {
                          await authFetch("/api/seller/profile/settings", {
                            method: "PATCH",
                            body: JSON.stringify({
                              notification_preferences: {
                                ...profileData.account_settings.notification_preferences,
                                [pref.id]: checked,
                              },
                            }),
                          });
                        } catch (err) {
                          console.error("toggle notif pref error", err);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6 animate-fade-in">
          {/* Password & Security */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-6">
              <span>🔐</span>
              <span>Keamanan & Kata Sandi</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-amber-900">Kata Sandi</p>
                    <p className="text-sm text-amber-700">
                      Terakhir diubah {getTimeAgo(profileData.security_settings.password_last_changed)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                  >
                    Ubah Kata Sandi
                  </button>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-900">Autentikasi 2 Faktor</p>
                    <p className="text-sm text-amber-700">Tambah lapisan keamanan ekstra</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {profileData.security_settings.two_factor_enabled ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ AKTIF</span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">✗ NONAKTIF</span>
                    )}
                    <button
                      onClick={async () => {
                        const next = !profileData.security_settings.two_factor_enabled;
                        setProfileData((prev: any) => ({
                          ...prev,
                          security_settings: { ...prev.security_settings, two_factor_enabled: next },
                        }));
                        try {
                          await authFetch("/api/seller/profile/security", {
                            method: "PATCH",
                            body: JSON.stringify({ two_factor_enabled: next }),
                          });
                        } catch (err) {
                          console.error("toggle 2FA error", err);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                    >
                      {profileData.security_settings.two_factor_enabled ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Devices */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-6">
              <span>💻</span>
              <span>Perangkat Aktif</span>
            </h3>

            <div className="space-y-3">
              {profileData.security_settings.login_devices.map((device: any) => (
                <div
                  key={device.device_id}
                  className={`p-4 border-2 rounded-xl ${
                    device.is_current_device
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl">
                        {device.device_name.includes("Windows") ? "💻" : "📱"}
                      </div>
                      <div>
                        <p className="font-bold text-amber-900 flex items-center gap-2">
                          {device.device_name}
                          {device.is_current_device && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">PERANGKAT INI</span>
                          )}
                        </p>
                        <p className="text-sm text-amber-700 mt-1">📍 {device.location}</p>
                        <p className="text-xs text-amber-600 mt-1">IP: {device.ip_address}</p>
                        <p className="text-xs text-amber-600">
                          Terakhir login: {new Date(device.last_login).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                    {!device.is_current_device && (
                      <button
                        onClick={async () => {
                          const id = (device as any).id ?? (device as any).device_id;
                          try {
                            await authFetch(`/api/seller/profile/security/devices/${id}`, { method: "DELETE" });
                            setProfileData((prev: any) => ({
                              ...prev,
                              security_settings: {
                                ...prev.security_settings,
                                login_devices: prev.security_settings.login_devices.filter((d: any) => (d.id ?? d.device_id) !== id),
                              },
                            }));
                          } catch (err) {
                            console.error("logout device error", err);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                      >
                        🚫 Logout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login History */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2 mb-6">
              <span>📜</span>
              <span>Riwayat Login</span>
            </h3>

            <div className="space-y-3">
              {profileData.security_settings.login_history.map((login: any) => (
                <div
                  key={login.login_id}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg shrink-0">
                    🔓
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-amber-900">{login.device}</p>
                      <span className="text-xs text-amber-700">•</span>
                      <p className="text-sm text-amber-700">📍 {login.location}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-amber-600">
                      <span>
                        {new Date(login.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <span>•</span>
                      <span>IP: {login.ip_address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="space-y-6 animate-fade-in">
          {/* Address Book Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span>📍</span>
              <span>Buku Alamat</span>
            </h3>
            <button
              onClick={() => setShowAddAddress(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>➕</span>
              <span>Tambah Alamat</span>
            </button>
          </div>

          {/* Address Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profileData.address_book.map((address: any) => (
              <div
                key={address.address_id}
                className={`bg-white/80 backdrop-blur-xl border-2 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all ${
                  address.is_default ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50" : "border-orange-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-amber-900 text-lg">{address.label}</h4>
                      {address.is_default && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-300">
                          ✓ UTAMA
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-amber-800">{address.recipient_name}</p>
                    <p className="text-sm text-amber-700">{address.phone}</p>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
                    ⋮
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-amber-900">{address.address_line1}</p>
                  {address.address_line2 && <p className="text-amber-800">{address.address_line2}</p>}
                  <p className="text-amber-800">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-amber-700">{address.country}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-orange-200">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
                    ✏️ Edit
                  </button>
                  {!address.is_default && (
                    <button
                      onClick={async () => {
                        const id = (address as any).id ?? (address as any).address_id;
                        try {
                          await authFetch(`/api/seller/profile/addresses/${id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ is_default: true }),
                          });
                          setProfileData((prev: any) => ({
                            ...prev,
                            address_book: prev.address_book.map((a: any) => ({
                              ...a,
                              is_default: (a.id ?? a.address_id) === id,
                            })),
                          }));
                        } catch (err) {
                          console.error("set default address error", err);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors"
                    >
                      ⭐ Jadikan Utama
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const id = (address as any).id ?? (address as any).address_id;
                      try {
                        await authFetch(`/api/seller/profile/addresses/${id}`, { method: "DELETE" });
                        setProfileData((prev: any) => ({
                          ...prev,
                          address_book: prev.address_book.filter((a: any) => (a.id ?? a.address_id) !== id),
                        }));
                      } catch (err) {
                        console.error("delete address error", err);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>✏️</span>
                <span>Edit Profil</span>
              </h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone_number: e.target.value }))}
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="px-6 py-3 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Batal
                </button>
                <button onClick={saveProfile} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  💾 Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>🔐</span>
                <span>Ubah Kata Sandi</span>
              </h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Kata Sandi Lama</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Masukkan kata sandi lama"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Kata Sandi Baru</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Masukkan kata sandi baru"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Konfirmasi kata sandi baru"
                />
              </div>

              <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Tips:</strong> Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk kata sandi yang kuat.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="px-6 py-3 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Batal
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  🔐 Ubah Kata Sandi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>📍</span>
                <span>Tambah Alamat Baru</span>
              </h3>
              <button
                onClick={() => setShowAddAddress(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Label Alamat</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Contoh: Rumah, Kantor, Gudang"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Nama Penerima</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-700 mb-2">Alamat Lengkap</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Jalan, nomor rumah, RT/RW"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Kota</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Provinsi</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Kode Pos</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Negara</label>
                  <input
                    type="text"
                    defaultValue="Indonesia"
                    className="w-full px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <input type="checkbox" id="set-default" className="w-4 h-4 text-orange-600 rounded" />
                <label htmlFor="set-default" className="text-sm font-semibold text-amber-900">
                  Jadikan alamat utama
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddAddress(false)}
                  className="px-6 py-3 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Batal
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  💾 Simpan Alamat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
