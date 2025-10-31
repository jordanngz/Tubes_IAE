"use client";

import { useState } from "react";
import SellerNavbar from "@/components/seller/navbar";
import SellerSidebar from "@/components/seller/sidebar";
import SellerFooter from "@/components/seller/footer";

export default function SellerPage() {

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Card */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 lg:p-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                    Welcome back, Seller! 👋
                  </h1>
                  <p className="text-amber-800">Here's what's happening with your store today.</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap">
                  + New Product
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              {[
                { label: "Total Sales", value: "Rp 12.5M", change: "+12%", icon: "💰", color: "from-green-400 to-emerald-500" },
                { label: "Orders", value: "324", change: "+8%", icon: "🛒", color: "from-blue-400 to-cyan-500" },
                { label: "Products", value: "156", change: "+5%", icon: "📦", color: "from-purple-400 to-pink-500" },
                { label: "Customers", value: "1,234", change: "+15%", icon: "👥", color: "from-orange-400 to-red-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{stat.icon}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Recent Orders</span>
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((order) => (
                  <div
                    key={order}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold">
                        #{order}
                      </div>
                      <div>
                        <p className="font-semibold text-amber-900">Order #100{order}</p>
                        <p className="text-sm text-amber-700">Customer {order} • 2 items</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-amber-900">Rp 250,000</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-1">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
