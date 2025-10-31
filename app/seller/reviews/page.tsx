"use client";

import { useState } from "react";
import Link from "next/link";

// Review & Feedback data placeholder
const reviewData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    total_reviews: 0,
    average_rating: 0.0,
    total_replied_reviews: 0,
    total_unreplied_reviews: 0,
  },
  product_reviews: [
    {
      review_id: null,
      product_id: null,
      product_name: "Sarden Pedas 350g",
      product_image: "/images/products/placeholder-1.jpg",
      user_id: null,
      user_name: "Nama Pembeli Placeholder",
      rating: 5,
      title: "Produk sangat enak!",
      body: "Rasa sarden pedasnya pas dan tidak amis. Recommended banget!",
      images: ["/images/reviews/review-photo-1.jpg"],
      created_at: "2025-11-01T09:00:00Z",
      is_visible: true,
      reply: {
        reply_id: null,
        seller_id: null,
        seller_name: "Nama Seller Placeholder",
        message: "Terima kasih atas ulasannya! Kami senang produk kami disukai 😊",
        replied_at: "2025-11-01T12:00:00Z",
      },
      helpful_count: 3,
      reported: false,
    },
    {
      review_id: null,
      product_id: null,
      product_name: "Tuna Kaleng Original 200g",
      product_image: "/images/products/placeholder-2.jpg",
      user_id: null,
      user_name: "Nama Pembeli Placeholder 2",
      rating: 3,
      title: "Rasa kurang kuat",
      body: "Produk oke tapi rasa tuna-nya kurang terasa kuat.",
      images: [],
      created_at: "2025-11-02T10:00:00Z",
      is_visible: true,
      reply: null,
      helpful_count: 0,
      reported: false,
    },
  ],
  review_summary: {
    total_reviews: 45,
    average_rating: 4.4,
    rating_distribution: {
      "5_star": 30,
      "4_star": 10,
      "3_star": 4,
      "2_star": 1,
      "1_star": 0,
    },
    most_reviewed_products: [
      {
        product_id: null,
        product_name: "Sarden Pedas 350g",
        review_count: 20,
        average_rating: 4.6,
      },
      {
        product_id: null,
        product_name: "Tuna Kaleng Original 200g",
        review_count: 10,
        average_rating: 4.2,
      },
    ],
  },
  activity_log: [
    {
      id: 1,
      type: "reply_review",
      description: "Seller membalas ulasan pada produk 'Sarden Pedas 350g'.",
      timestamp: "2025-11-01T12:00:00Z",
    },
    {
      id: 2,
      type: "hide_review",
      description: "Ulasan produk 'Tuna Kaleng Original 200g' disembunyikan karena laporan pembeli.",
      timestamp: "2025-11-02T14:30:00Z",
    },
    {
      id: 3,
      type: "mark_review_visible",
      description: "Ulasan sebelumnya diaktifkan kembali setelah verifikasi.",
      timestamp: "2025-11-03T09:45:00Z",
    },
  ],
};

export default function ReviewsPage() {
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [filterReplied, setFilterReplied] = useState<string>("all");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-lg",
      lg: "text-2xl",
    };

    return (
      <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "text-yellow-400" : "text-gray-300"}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const getRatingPercentage = (count: number, total: number) => {
    return Math.round((count / total) * 100);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>⭐</span>
            <span>Ulasan & Komentar</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola dan balas ulasan dari pelanggan Anda</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2">
            <span>📊</span>
            <span>Ekspor Ulasan</span>
          </button>
        </div>
      </div>

      {/* Rating Summary Card */}
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Rating */}
          <div className="text-center lg:border-r-2 lg:border-orange-200">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-3 shadow-lg">
              <span className="text-4xl font-bold text-white">{reviewData.review_summary.average_rating}</span>
            </div>
            {renderStars(Math.round(reviewData.review_summary.average_rating), "lg")}
            <p className="text-amber-700 mt-2 font-semibold">
              {reviewData.review_summary.total_reviews} Ulasan
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="lg:col-span-2 space-y-2">
            <p className="font-bold text-amber-900 mb-3">Distribusi Rating</p>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewData.review_summary.rating_distribution[`${star}_star` as keyof typeof reviewData.review_summary.rating_distribution];
              const percentage = getRatingPercentage(count, reviewData.review_summary.total_reviews);

              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-amber-900 font-semibold">{star}</span>
                    <span className="text-yellow-400">⭐</span>
                  </div>
                  <div className="flex-1 h-3 bg-orange-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-amber-900 w-12 text-right">{count}</span>
                  <span className="text-xs text-amber-700 w-12 text-right">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        {[
          {
            label: "Total Ulasan",
            value: reviewData.review_summary.total_reviews,
            icon: "💬",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Sudah Dibalas",
            value: reviewData.store_info.total_replied_reviews,
            icon: "✅",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Belum Dibalas",
            value: reviewData.store_info.total_unreplied_reviews,
            icon: "⏳",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "Rata-rata Rating",
            value: reviewData.review_summary.average_rating.toFixed(1),
            icon: "⭐",
            color: "from-yellow-400 to-orange-500",
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

      {/* Most Reviewed Products */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-amber-900">Produk Paling Banyak Diulas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviewData.review_summary.most_reviewed_products.map((product, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-amber-900">{product.product_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(Math.round(product.average_rating), "sm")}
                    <span className={`font-bold ${getRatingColor(product.average_rating)}`}>
                      {product.average_rating}
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">{product.review_count} ulasan</p>
                </div>
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-3xl">
                  🥫
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filter by Rating */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterRating("all")}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                filterRating === "all"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                  : "bg-orange-50 text-amber-900 hover:bg-orange-100"
              }`}
            >
              <span>📦</span>
              <span>Semua</span>
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  filterRating === rating
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                    : "bg-orange-50 text-amber-900 hover:bg-orange-100"
                }`}
              >
                <span>{rating}</span>
                <span>⭐</span>
              </button>
            ))}
          </div>

          {/* Filter by Reply Status */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "Semua", icon: "💬" },
              { id: "replied", label: "Dibalas", icon: "✅" },
              { id: "unreplied", label: "Belum Dibalas", icon: "⏳" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterReplied(filter.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  filterReplied === filter.id
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md scale-105"
                    : "bg-orange-50 text-amber-900 hover:bg-orange-100"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 animate-fade-in">
        {reviewData.product_reviews.map((review, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Review Header */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 border-b-2 border-orange-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-amber-900">{review.user_name}</p>
                      {renderStars(review.rating, "sm")}
                      {!review.reply && (
                        <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">
                          Belum Dibalas
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-amber-700">
                      {new Date(review.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-2 p-2 bg-white/80 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg flex items-center justify-center text-xl">
                    🥫
                  </div>
                  <div>
                    <p className="text-xs text-amber-700">Produk</p>
                    <p className="text-sm font-semibold text-amber-900">{review.product_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="p-4 space-y-4">
              {/* Review Text */}
              <div>
                <h4 className="font-bold text-amber-900 mb-2">{review.title}</h4>
                <p className="text-amber-800">{review.body}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {review.images.map((image, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg flex items-center justify-center text-3xl shrink-0 border-2 border-orange-300 hover:scale-105 transition-transform cursor-pointer"
                    >
                      📷
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Count */}
              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg text-amber-900 font-medium transition-colors">
                  <span>👍</span>
                  <span>{review.helpful_count} orang terbantu</span>
                </button>
                {review.reported && (
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-300">
                    ⚠️ Dilaporkan
                  </span>
                )}
              </div>

              {/* Seller Reply */}
              {review.reply ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                      🏪
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-blue-900">{review.reply.seller_name}</p>
                        <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs font-bold">
                          Seller
                        </span>
                        <span className="text-xs text-blue-700">
                          {new Date(review.reply.replied_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-blue-900">{review.reply.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Reply Form */}
                  {showReplyForm === idx ? (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
                      <p className="font-bold text-amber-900 mb-3">💬 Balas Ulasan</p>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan Anda..."
                        className="w-full h-24 p-3 bg-white border-2 border-orange-200 rounded-lg text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                      <div className="flex gap-2 mt-3">
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
                          📤 Kirim Balasan
                        </button>
                        <button
                          onClick={() => {
                            setShowReplyForm(null);
                            setReplyText("");
                          }}
                          className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors"
                        >
                          ✖️ Batal
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-200">
                {!review.reply && !showReplyForm && (
                  <button
                    onClick={() => setShowReplyForm(idx)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <span>💬</span>
                    <span>Balas Ulasan</span>
                  </button>
                )}
                {review.reply && (
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2">
                    <span>✏️</span>
                    <span>Edit Balasan</span>
                  </button>
                )}
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <span>🔗</span>
                  <span>Lihat Produk</span>
                </button>
                {review.is_visible ? (
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-2">
                    <span>👁️‍🗨️</span>
                    <span>Sembunyikan</span>
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition-colors flex items-center gap-2">
                    <span>👁️</span>
                    <span>Tampilkan</span>
                  </button>
                )}
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Laporkan</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Ulasan Terbaru</h2>
        </div>

        <div className="space-y-3">
          {reviewData.activity_log.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold shrink-0">
                {activity.type === "reply_review"
                  ? "💬"
                  : activity.type === "hide_review"
                  ? "👁️‍🗨️"
                  : activity.type === "mark_review_visible"
                  ? "👁️"
                  : "📦"}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
