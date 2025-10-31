"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

type SellerSidebarProps = {
  isMobileOpen?: boolean;
  onClose?: () => void;
};

export default function SellerSidebar({ isMobileOpen = false, onClose }: SellerSidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { label: "Dashboard Utama", href: "/seller", icon: "🏠" },
    { label: "Manajemen Toko", href: "/seller/stores", icon: "🏪" },
    { label: "Manajemen Produk", href: "/seller/products", icon: "📦", badge: 12 },
    { label: "Manajemen Pesanan", href: "/seller/orders", icon: "🛒", badge: 5 },
    { label: "Pengiriman", href: "/seller/shipping", icon: "🚚" },
    { label: "Promosi dan Kupon", href: "/seller/promotions", icon: "🎟️" },
    { label: "Ulasan & Komentar", href: "/seller/reviews", icon: "⭐" },
    { label: "Laporan Analitik", href: "/seller/analytics", icon: "📈" },
    { label: "Notifikasi & Aktivitas", href: "/seller/notifications", icon: "🔔", badge: 3 },
    { label: "Chat & Komunikasi", href: "/seller/chat", icon: "💬", badge: 2 },
    { label: "Profil & Akun", href: "/seller/profile", icon: "👤" },
  ];

  const isActive = (href: string) => pathname === href;

  const sidebarContent = (
    <div className="bg-white/80 backdrop-blur-xl border border-orange-200/50 rounded-2xl shadow-lg p-4 space-y-4">
      {/* Header */}
      <div className="px-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          📂 Menu Seller
        </p>
        {isMobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Menu */}
      <nav className="space-y-1 text-sm">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const hovered = hoveredItem === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                group relative flex items-center justify-between px-3 py-2.5 rounded-lg font-medium
                transition-all duration-300
                ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                    : "text-amber-900 hover:bg-orange-50 hover:scale-105"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg transition-transform duration-300 ${
                    hovered ? "scale-125 rotate-12" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`
                  flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                  transition-all duration-300
                  ${
                    active
                      ? "bg-white text-orange-600"
                      : "bg-gradient-to-r from-orange-400 to-red-500 text-white animate-pulse"
                  }
                `}
                >
                  {item.badge}
                </span>
              )}

              {/* Hover indicator */}
              {hovered && !active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-red-500 rounded-r-full animate-fade-in" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 animate-fade-in">
        <div className="fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] overflow-y-auto p-4">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={onClose}
          />
          {/* Sidebar */}
          <aside className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden animate-slide-in-left">
            <div className="h-full overflow-y-auto p-4">{sidebarContent}</div>
          </aside>
        </>
      )}
    </>
  );
}
