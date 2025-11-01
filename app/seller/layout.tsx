"use client";

import { useEffect, useRef, useState } from "react";
import SellerNavbar from "@/components/seller/navbar";
import SellerSidebar from "@/components/seller/sidebar";
import SellerFooter from "@/components/seller/footer";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (authLoading) return; // wait until Firebase auth resolves
      try {
        if (!user) {
          if (!mounted) return;
          setAllowed(false);
          setChecking(false);
          if (!redirected.current) {
            redirected.current = true;
            router.replace("/");
          }
          return;
        }
        const token = await user.getIdToken();
        const res = await fetch("/api/user/roles", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data.roles) && data.roles.includes("seller")) {
          setAllowed(true);
        } else {
          setAllowed(false);
          if (!redirected.current) {
            redirected.current = true;
            // Go back if possible, otherwise home
            router.replace("/");
          }
        }
      } catch (e) {
        setAllowed(false);
        if (!redirected.current) {
          redirected.current = true;
          router.replace("/");
        }
      } finally {
        if (mounted) setChecking(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [authLoading, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <SellerNavbar title="Seller" onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        <SellerSidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {checking ? (
              <div className="space-y-4">
                <div className="h-10 w-1/3 bg-orange-100 rounded-lg animate-pulse" />
                <div className="h-24 w-full bg-orange-50 border-2 border-orange-200 rounded-xl animate-pulse" />
                <div className="h-96 w-full bg-orange-50 border-2 border-orange-200 rounded-xl animate-pulse" />
              </div>
            ) : allowed ? (
              children
            ) : null}
          </div>
        </main>
      </div>
      <SellerFooter />
    </div>
  );
}
