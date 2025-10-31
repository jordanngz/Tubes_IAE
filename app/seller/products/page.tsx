"use client";

import { useState } from "react";
import Link from "next/link";

// Product data placeholder
const productData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    status: "approved",
    total_products: 0,
    total_sold: 0,
    rating_avg: 0.0,
  },
  product_list: [
    {
      id: 1,
      store_id: null,
      name: "Sarden Pedas Premium 350g",
      slug: "sarden-pedas-premium-350g",
      sku: "SKU-SARDEN-001",
      short_description: "Sarden pilihan dengan bumbu pedas khas Indonesia.",
      description: "Ikan sarden berkualitas tinggi dengan bumbu pedas yang nikmat.",
      price: 25000.0,
      compare_at_price: 30000.0,
      stock: 100,
      sold_count: 45,
      weight_grams: 350,
      attributes: {
        brand: "Premium Cans",
        flavor: "Sarden Pedas",
        size: "350g",
      },
      is_active: true,
      is_published: true,
      published_at: "2025-11-01T00:00:00Z",
      rating_avg: 4.5,
      rating_count: 12,
      categories: ["Makanan Kaleng", "Seafood"],
      images: ["/images/products/placeholder-1.jpg"],
      promotions: [
        {
          name: "Diskon Awal Bulan",
          type: "percentage",
          value: 10.0,
          is_active: true,
        },
      ],
    },
    {
      id: 2,
      store_id: null,
      name: "Kornet Sapi Original 200g",
      slug: "kornet-sapi-original-200g",
      sku: "SKU-KORNET-001",
      short_description: "Kornet sapi berkualitas tinggi.",
      description: "Daging sapi pilihan yang diolah menjadi kornet lezat.",
      price: 35000.0,
      compare_at_price: 40000.0,
      stock: 75,
      sold_count: 32,
      weight_grams: 200,
      attributes: {
        brand: "Premium Cans",
        flavor: "Original",
        size: "200g",
      },
      is_active: true,
      is_published: true,
      published_at: "2025-11-01T00:00:00Z",
      rating_avg: 4.8,
      rating_count: 18,
      categories: ["Makanan Kaleng", "Daging"],
      images: ["/images/products/placeholder-2.jpg"],
      promotions: [],
    },
    {
      id: 3,
      store_id: null,
      name: "Buah Kaleng Cocktail Mix 400g",
      slug: "buah-kaleng-cocktail-mix-400g",
      sku: "SKU-FRUIT-001",
      short_description: "Campuran buah segar dalam kaleng.",
      description: "Berbagai buah pilihan dalam sirup manis.",
      price: 20000.0,
      compare_at_price: null,
      stock: 5,
      sold_count: 89,
      weight_grams: 400,
      attributes: {
        brand: "Fresh Cans",
        flavor: "Mix Fruits",
        size: "400g",
      },
      is_active: true,
      is_published: true,
      published_at: "2025-11-01T00:00:00Z",
      rating_avg: 4.2,
      rating_count: 25,
      categories: ["Makanan Kaleng", "Buah"],
      images: ["/images/products/placeholder-3.jpg"],
      promotions: [],
    },
  ],
  product_statistics: {
    total_products: 10,
    active_products: 8,
    inactive_products: 2,
    low_stock_products: 1,
    out_of_stock_products: 0,
    total_reviews: 24,
    average_rating: 4.3,
  },
  product_reviews: [
    {
      id: 1,
      rating: 5,
      title: "Produk sangat bagus!",
      body: "Kualitas ikan sarden sangat segar dan tidak amis.",
      images: [],
      is_visible: true,
      reply: null,
      created_at: "2025-11-01T00:00:00Z",
    },
    {
      id: 2,
      rating: 3,
      title: "Rasa kurang pedas",
      body: "Sesuai deskripsi tapi kurang sesuai selera saya.",
      images: [],
      is_visible: true,
      reply: "Terima kasih atas sarannya! Kami akan tingkatkan rasa pedasnya.",
      replied_at: "2025-11-01T02:00:00Z",
    },
  ],
  activity_log: [
    {
      id: 1,
      type: "create_product",
      description: "Menambahkan produk baru 'Sarden Pedas 350g'.",
      timestamp: "2025-11-01T00:10:00Z",
    },
    {
      id: 2,
      type: "update_stock",
      description: "Mengubah stok produk 'Sarden Pedas 350g' dari 100 menjadi 80.",
      timestamp: "2025-11-01T01:00:00Z",
    },
  ],
};

export default function ProductManagementPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "low-stock">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Habis", color: "bg-red-100 text-red-700 border-red-300" };
    if (stock < 10) return { label: "Stok Rendah", color: "bg-yellow-100 text-yellow-700 border-yellow-300" };
    return { label: "Tersedia", color: "bg-green-100 text-green-700 border-green-300" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountPercentage = (price: number, comparePrice: number | null) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>📦</span>
            <span>Manajemen Produk</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola produk, stok, harga, dan promosi Anda</p>
        </div>
        <Link href="/seller/products/create">
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
            <span>➕</span>
            <span>Tambah Produk</span>
          </button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
        {[
          {
            label: "Total Produk",
            value: productData.product_statistics.total_products,
            icon: "📦",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Aktif",
            value: productData.product_statistics.active_products,
            icon: "✅",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Tidak Aktif",
            value: productData.product_statistics.inactive_products,
            icon: "⭕",
            color: "from-gray-400 to-gray-500",
          },
          {
            label: "Stok Rendah",
            value: productData.product_statistics.low_stock_products,
            icon: "⚠️",
            color: "from-yellow-400 to-orange-500",
          },
          {
            label: "Habis",
            value: productData.product_statistics.out_of_stock_products,
            icon: "🔴",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Total Ulasan",
            value: productData.product_statistics.total_reviews,
            icon: "⭐",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Rating Rata-rata",
            value: productData.product_statistics.average_rating.toFixed(1),
            icon: "🌟",
            color: "from-yellow-400 to-amber-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-amber-700 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="search"
                placeholder="Cari produk berdasarkan nama atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-orange-50 border-2 border-orange-200 text-sm text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "Semua", icon: "📦" },
              { id: "active", label: "Aktif", icon: "✅" },
              { id: "inactive", label: "Nonaktif", icon: "⭕" },
              { id: "low-stock", label: "Stok Rendah", icon: "⚠️" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as any)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  filterStatus === filter.id
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                    : "bg-orange-50 text-amber-900 hover:bg-orange-100"
                }`}
              >
                <span>{filter.icon}</span>
                <span className="hidden md:inline">{filter.label}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border-2 border-orange-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid" ? "bg-orange-500 text-white" : "text-amber-700 hover:bg-orange-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list" ? "bg-orange-500 text-white" : "text-amber-700 hover:bg-orange-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div
        className={`grid gap-4 animate-fade-in ${
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        }`}
      >
        {productData.product_list.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          const discount = getDiscountPercentage(product.price, product.compare_at_price);

          return (
            <div
              key={product.id}
              className={`bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-102 overflow-hidden ${
                viewMode === "list" ? "flex flex-col md:flex-row" : ""
              }`}
            >
              {/* Product Image */}
              <div
                className={`relative bg-gradient-to-br from-orange-200 to-amber-200 ${
                  viewMode === "list" ? "md:w-48 h-48 md:h-auto" : "aspect-square"
                } flex items-center justify-center`}
              >
                <span className="text-6xl">🥫</span>
                {discount && (
                  <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    -{discount}%
                  </div>
                )}
                {product.promotions.length > 0 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                    🎟️ Promo
                  </div>
                )}
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg border-2 text-xs font-bold ${stockStatus.color}`}>
                  {stockStatus.label}
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-4 flex flex-col ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-amber-900 text-lg line-clamp-2">{product.name}</h3>
                  <button className="text-orange-600 hover:text-orange-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-amber-700 mb-2">SKU: {product.sku}</p>
                <p className="text-sm text-amber-800 line-clamp-2 mb-3">{product.short_description}</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Price & Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-amber-900">{formatCurrency(product.price)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-gray-500 line-through">{formatCurrency(product.compare_at_price)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-amber-900">{product.rating_avg}</span>
                    <span className="text-amber-700">({product.rating_count})</span>
                  </div>
                </div>

                {/* Stock & Sold */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span>📦</span>
                    <span>Stok: <strong>{product.stock}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <span>🛒</span>
                    <span>Terjual: <strong>{product.sold_count}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
                    <button className="w-full px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors">
                      ✏️ Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => setSelectedProduct(product.id)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300"
                  >
                    👁️ Detail
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reviews Section */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⭐</span>
          <h2 className="text-xl font-bold text-amber-900">Ulasan Terbaru</h2>
        </div>

        <div className="space-y-4">
          {productData.product_reviews.map((review) => (
            <div key={review.id} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">{review.title}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-amber-700">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString("id-ID") : "-"}
                </span>
              </div>

              <p className="text-amber-800 mb-3">{review.body}</p>

              {review.reply && (
                <div className="mt-3 pl-4 border-l-4 border-orange-300 bg-orange-100/50 p-3 rounded">
                  <p className="text-sm font-semibold text-amber-900 mb-1">💬 Balasan Penjual:</p>
                  <p className="text-sm text-amber-800">{review.reply}</p>
                </div>
              )}

              {!review.reply && (
                <button className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  💬 Balas Ulasan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Produk Terbaru</h2>
        </div>

        <div className="space-y-3">
          {productData.activity_log.map((activity) => (
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
              <span className="text-lg">
                {activity.type === "create_product" ? "➕" : activity.type === "update_stock" ? "📦" : "✏️"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
