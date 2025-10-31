"use client";

import { useState } from "react";
import SellerNavbar from "@/components/seller/navbar";
import SellerSidebar from "@/components/seller/sidebar";
import SellerFooter from "@/components/seller/footer";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <SellerNavbar title="Seller" onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1">
        <SellerSidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <SellerFooter />
    </div>
  );
}
