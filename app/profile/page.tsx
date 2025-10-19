"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    city: "",
    postalCode: "",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cannedit_user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const user = JSON.parse(storedUser)
    if (!user.loggedIn) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)

    // Load profile data
    const savedProfile = localStorage.getItem("cannedit_profile")
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile))
    } else {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }))
    }
  }, [router])

  const handleSave = () => {
    localStorage.setItem("cannedit_profile", JSON.stringify(profileData))
    setIsEditing(false)
    alert("Profil berhasil diperbarui!")
  }

  if (!isLoggedIn) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 animate-gradient relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Profil Saya</h1>
          <p className="text-gray-700">Kelola informasi profil Anda</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md animate-fade-in-up delay-100">
          {/* Profile Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">
              {profileData.name
                ? profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name || "Nama Pengguna"}</h2>
              <p className="text-gray-600">{profileData.email}</p>
            </div>
          </div>

          {/* Biodata Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Biodata Diri</h3>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  Ubah Biodata
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                    Simpan
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-2 border-gray-300 hover:bg-gray-50"
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Jenis Kelamin
                </label>
                <select
                  value={profileData.gender}
                  onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Ubah Kontak</h3>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Nomor HP
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Alamat</h3>
            <div className="space-y-4">
              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Alamat Lengkap
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Kota</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Kode Pos</label>
                  <input
                    type="text"
                    value={profileData.postalCode}
                    onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
