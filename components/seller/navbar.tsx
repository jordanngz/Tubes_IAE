"use client";

import Link from "next/link";

type SellerNavbarProps = {
  title?: string;
  onMenuToggle?: () => void;
};

export default function SellerNavbar({ title = "Seller", onMenuToggle }: SellerNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-orange-200/50 shadow-lg animate-fade-in-down">
      <div className="w-full px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-base font-bold text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-rotate-6">
              🏪
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {title}
              </span>
              <p className="text-xs text-amber-700">Dashboard</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 animate-fade-in">
            {/* Notifications */}
            <Link href="/seller/notifications">
              <button
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-orange-500 flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
            </Link>

            {/* Profile */}
            <Link href="/seller/profile">
              <button
                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-orange-500 flex items-center justify-center text-white font-bold hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95"
                aria-label="Profile"
              >
                👤
              </button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-10 h-10 rounded-lg bg-gradient-to-br from-orange-300 to-orange-400 border-2 border-orange-500 flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
