"use client"

import { useState } from "react"
import Link from "next/link"
import ProfileMenu from "./profile-menu"
import { useCart } from "@/lib/cart-context"
import CartModal from "./cart-modal"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { totalItems } = useCart()

  const navItems = [
    { label: "HOME", href: "/" },
    { label: "MENU", href: "/menu" },
    { label: "OFFERS", href: "/offers" },
    { label: "SERVICES", href: "/services" },
    { label: "ABOUT US", href: "/about" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-orange-200/50 shadow-lg animate-fade-in-down">
        <div className="w-full px-4">
          <div className="flex items-center gap-4 py-3 justify-between">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    idx === 0
                      ? "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-xl hover:scale-105"
                      : "text-amber-900 hover:bg-orange-100 hover:scale-105"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form className="hidden md:flex flex-1 relative max-w-md mx-4 animate-fade-in">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 transition-transform duration-300 peer-focus:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Cari sarden, kornet, buah kaleng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="peer w-full h-10 pl-10 pr-4 rounded-full bg-white/80 backdrop-blur-sm border-2 border-orange-200 text-sm text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-300"
              />
            </form>

            <div className="flex items-center gap-2 animate-fade-in">
              <button
                className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-orange-500 flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                aria-label="Notifikasi"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 4h6"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-orange-500 flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                aria-label="Keranjang"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L21 6H6" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
