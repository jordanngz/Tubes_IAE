"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [filterReplied, setFilterReplied] = useState<string>("all");
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch("/api/seller/reviews", { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

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

  const reviews = useMemo(() => {
    const items: any[] = data?.product_reviews || [];
    return items
      .filter((r) => (filterRating === "all" ? true : Number(r.rating) === filterRating))
      .filter((r) => {
        if (filterReplied === "all") return true;
        if (filterReplied === "replied") return !!r.reply && !!r.reply.message;
        if (filterReplied === "unreplied") return !r.reply || !r.reply.message;
        return true;
      });
  }, [data, filterRating, filterReplied]);

  const onSendReply = async (reviewId: string) => {
    if (!user || !replyText.trim()) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply_message: replyText.trim() }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setData((prev: any) => ({
        ...prev,
        product_reviews: (prev?.product_reviews || []).map((r: any) => (r.id === reviewId ? { ...r, ...updated } : r)),
      }));
      setShowReplyForm(null);
      setReplyText("");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVisibility = async (reviewId: string, nextVisible: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_visible: nextVisible }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setData((prev: any) => ({
        ...prev,
        product_reviews: (prev?.product_reviews || []).map((r: any) => (r.id === reviewId ? { ...r, ...updated } : r)),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleReport = async (reviewId: string, nextReported: boolean) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reported: nextReported }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setData((prev: any) => ({
        ...prev,
        product_reviews: (prev?.product_reviews || []).map((r: any) => (r.id === reviewId ? { ...r, ...updated } : r)),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const incrementHelpful = async (reviewId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/seller/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ helpful_delta: 1 }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setData((prev: any) => ({
        ...prev,
        product_reviews: (prev?.product_reviews || []).map((r: any) => (r.id === reviewId ? { ...r, ...updated } : r)),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const exportReviews = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/seller/reviews/export", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reviews_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
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
          <button onClick={exportReviews} className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2">
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
              <span className="text-4xl font-bold text-white">{data?.review_summary?.average_rating || 0}</span>
            </div>
            {renderStars(Math.round(data?.review_summary?.average_rating || 0), "lg")}
            <p className="text-amber-700 mt-2 font-semibold">
              {data?.review_summary?.total_reviews || 0} Ulasan
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="lg:col-span-2 space-y-2">
            <p className="font-bold text-amber-900 mb-3">Distribusi Rating</p>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data?.review_summary?.rating_distribution?.[`${star}_star`] || 0;
              const total = data?.review_summary?.total_reviews || 0;
              const percentage = total > 0 ? getRatingPercentage(count, total) : 0;

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
            value: data?.review_summary?.total_reviews || 0,
            icon: "💬",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Sudah Dibalas",
            value: data?.store_info?.total_replied_reviews || 0,
            icon: "✅",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Belum Dibalas",
            value: data?.store_info?.total_unreplied_reviews || 0,
            icon: "⏳",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "Rata-rata Rating",
            value: (data?.review_summary?.average_rating || 0).toFixed ? (data?.review_summary?.average_rating || 0).toFixed(1) : (data?.review_summary?.average_rating || 0),
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
          {(data?.review_summary?.most_reviewed_products || []).map((product: any, idx: number) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-amber-900">{product.product_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(Math.round(product.average_rating || 0), "sm")}
                    <span className={`font-bold ${getRatingColor(product.average_rating || 0)}`}>
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

      {/* Loading or Not logged in */}
      {!user ? (
        <div className="p-6 bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg">
          <p className="text-amber-900">Silakan masuk terlebih dahulu.</p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="h-10 w-1/3 bg-orange-100 rounded-lg animate-pulse" />
          <div className="h-24 w-full bg-orange-50 border-2 border-orange-200 rounded-xl animate-pulse" />
          <div className="h-96 w-full bg-orange-50 border-2 border-orange-200 rounded-xl animate-pulse" />
        </div>
      ) : null}

      {/* Reviews List */}
      <div className="space-y-4 animate-fade-in">
        {reviews.map((review: any, idx: number) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Review Header */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 border-b-2 border-orange-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {(review.user_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-amber-900">{review.user_name}</p>
                      {renderStars(Number(review.rating || 0), "sm")}
                      {(!review.reply || !review.reply.message) && (
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
                  {review.images.map((image: string, imgIdx: number) => (
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
                <button onClick={() => incrementHelpful(review.id)} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg text-amber-900 font-medium transition-colors">
                  <span>👍</span>
                  <span>{review.helpful_count || 0} orang terbantu</span>
                </button>
                {review.reported && (
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-300">
                    ⚠️ Dilaporkan
                  </span>
                )}
              </div>

              {/* Seller Reply */}
              {review.reply && review.reply.message ? (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                      🏪
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-blue-900">{review.reply.seller_name || "Seller"}</p>
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
                  {showReplyForm === review.id ? (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
                      <p className="font-bold text-amber-900 mb-3">💬 Balas Ulasan</p>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan Anda..."
                        className="w-full h-24 p-3 bg-white border-2 border-orange-200 rounded-lg text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => onSendReply(review.id)} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
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
                {(!review.reply || !review.reply.message) && showReplyForm !== review.id && (
                  <button
                    onClick={() => { setShowReplyForm(review.id); setReplyText(""); }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <span>💬</span>
                    <span>Balas Ulasan</span>
                  </button>
                )}
                {review.reply && review.reply.message && (
                  <button onClick={() => { setShowReplyForm(review.id); setReplyText(review.reply.message || ""); }} className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2">
                    <span>✏️</span>
                    <span>Edit Balasan</span>
                  </button>
                )}
                <Link href={`/seller/products`} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <span>🔗</span>
                  <span>Lihat Produk</span>
                </Link>
                {review.is_visible ? (
                  <button onClick={() => toggleVisibility(review.id, false)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-2">
                    <span>👁️‍🗨️</span>
                    <span>Sembunyikan</span>
                  </button>
                ) : (
                  <button onClick={() => toggleVisibility(review.id, true)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition-colors flex items-center gap-2">
                    <span>👁️</span>
                    <span>Tampilkan</span>
                  </button>
                )}
                <button onClick={() => toggleReport(review.id, !review.reported)} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
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
          {(data?.activity_log || []).map((activity: any) => (
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
