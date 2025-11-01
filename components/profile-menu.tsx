"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { listenAuth, logout } from "@/lib/auth"
import { User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ProfileMenu() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const unsubscribe = listenAuth((user: User | null) => {
      if (user) {
        setIsLoggedIn(true)
        setUserData({
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email || "user@cannedit.id",
        })
        localStorage.setItem(
          "cannedit_user",
          JSON.stringify({
            loggedIn: true,
            name: user.displayName,
            email: user.email,
          })
        )
      } else {
        setIsLoggedIn(false)
        setUserData(null)
        localStorage.removeItem("cannedit_user")
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsLoggedIn(false)
    setUserData(null)
    setIsOpen(false)
    router.push("/")
  }

  const getInitials = () => {
    if (!userData) return "?"
    return userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const goSellerMode = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return router.push("/login")
      await fetch("/api/seller/role", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
      setIsOpen(false)
      router.push("/seller/stores")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center hover:bg-green-700 transition-colors"
        aria-label="Profil"
        aria-expanded={isOpen}
      >
        {isLoggedIn ? getInitials() : "?"}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {!isLoggedIn ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                    ?
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Belum Login</p>
                  <p className="text-xs text-slate-600">Masuk untuk mengakses akun Anda</p>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block w-full py-2 px-4 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full py-2 px-4 bg-amber-50 text-green-600 rounded-lg font-semibold text-sm hover:bg-amber-100 transition-colors text-center border border-green-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Daftar Sekarang
                  </Link>
                </div>

                <hr className="my-3" />

                <nav className="space-y-1">
                  <Link
                    href="/help"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Bantuan
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Tentang Kami
                  </Link>
                </nav>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-2">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getInitials()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900">{userData?.name || "User"}</p>
                    <p className="text-xs text-slate-600 truncate">{userData?.email || "user@cannedit.id"}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <button
                    onClick={goSellerMode}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white transition-colors text-sm font-semibold justify-center"
                  >
                    Masuk Mode Penjual
                  </button>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profil Saya
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Pesanan
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Wishlist
                  </Link>
                  <hr className="my-2" />
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm text-slate-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Pengaturan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Keluar
                  </button>
                </nav>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
