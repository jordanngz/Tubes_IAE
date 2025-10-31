"use client";

import { useState } from "react";
import Link from "next/link";

// Order data placeholder
const orderData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    total_orders: 0,
    total_revenue: 0.0,
    pending_orders: 0,
    processing_orders: 0,
    completed_orders: 0,
  },
  orders: [
    {
      order_shop_id: 1,
      order_id: 1,
      store_id: null,
      order_number: "ORD-20251101-001",
      buyer_name: "Ahmad Hidayat",
      buyer_contact: "+62-812-3456-7890",
      status: "pending",
      shipping_method: "JNE REG",
      shipping_cost: 10000.0,
      tracking_number: null,
      subtotal: 75000.0,
      discount_total: 5000.0,
      total: 80000.0,
      payment_status: "unpaid",
      payment_method: "Midtrans - Bank Transfer",
      order_date: "2025-11-01T08:30:00Z",
      updated_at: "2025-11-01T08:30:00Z",
      shipping_address: {
        recipient_name: "Ahmad Hidayat",
        phone: "+62-812-3456-7890",
        address_line1: "Jl. Sudirman No.123",
        city: "Jakarta Selatan",
        state: "DKI Jakarta",
        postal_code: "12190",
        country: "ID",
      },
      items: [
        {
          order_item_id: 1,
          product_id: 1,
          product_name: "Sarden Pedas Premium 350g",
          product_sku: "SKU-SP350",
          quantity: 2,
          price: 25000.0,
          total: 50000.0,
          attributes: { flavor: "Pedas", weight: "350g" },
          product_image: "/images/products/placeholder-1.jpg",
        },
        {
          order_item_id: 2,
          product_id: 2,
          product_name: "Tuna Kaleng Original 200g",
          product_sku: "SKU-TU200",
          quantity: 1,
          price: 25000.0,
          total: 25000.0,
          attributes: { flavor: "Original", weight: "200g" },
          product_image: "/images/products/placeholder-2.jpg",
        },
      ],
      payment_info: {
        payment_id: 1,
        provider: "Midtrans",
        provider_ref: "MTPAY-1234567890",
        amount: 80000.0,
        status: "pending",
        paid_at: null,
        currency: "IDR",
      },
      shipment_info: {
        shipment_id: null,
        carrier_name: "JNE",
        service_code: "REG",
        tracking_number: null,
        status: "created",
        shipped_at: null,
        delivered_at: null,
        cost: 10000.0,
        events: [],
      },
      buyer_notes: "Mohon kirim cepat ya, butuh untuk acara besok.",
      seller_notes: "",
      actions: {
        mark_as_processing: true,
        mark_as_shipped: false,
        mark_as_delivered: false,
        cancel_order: true,
        print_invoice: true,
      },
    },
    {
      order_shop_id: 2,
      order_id: 2,
      store_id: null,
      order_number: "ORD-20251031-087",
      buyer_name: "Siti Nurhaliza",
      buyer_contact: "+62-856-7890-1234",
      status: "processing",
      shipping_method: "JNT Express",
      shipping_cost: 12000.0,
      tracking_number: "JNT1234567890",
      subtotal: 105000.0,
      discount_total: 10000.0,
      total: 107000.0,
      payment_status: "paid",
      payment_method: "Midtrans - GoPay",
      order_date: "2025-10-31T14:20:00Z",
      updated_at: "2025-11-01T09:00:00Z",
      shipping_address: {
        recipient_name: "Siti Nurhaliza",
        phone: "+62-856-7890-1234",
        address_line1: "Jl. Gatot Subroto No.45",
        city: "Bandung",
        state: "Jawa Barat",
        postal_code: "40262",
        country: "ID",
      },
      items: [
        {
          order_item_id: 3,
          product_id: 3,
          product_name: "Kornet Sapi Original 200g",
          product_sku: "SKU-KO200",
          quantity: 3,
          price: 35000.0,
          total: 105000.0,
          attributes: { flavor: "Original", weight: "200g" },
          product_image: "/images/products/placeholder-3.jpg",
        },
      ],
      payment_info: {
        payment_id: 2,
        provider: "Midtrans",
        provider_ref: "MTPAY-0987654321",
        amount: 107000.0,
        status: "paid",
        paid_at: "2025-10-31T14:25:00Z",
        currency: "IDR",
      },
      shipment_info: {
        shipment_id: 2,
        carrier_name: "J&T Express",
        service_code: "REG",
        tracking_number: "JNT1234567890",
        status: "in_transit",
        shipped_at: "2025-11-01T09:00:00Z",
        delivered_at: null,
        cost: 12000.0,
        events: [
          {
            event_id: 1,
            status: "picked_up",
            description: "Paket telah diambil oleh kurir.",
            occurred_at: "2025-11-01T09:00:00Z",
          },
          {
            event_id: 2,
            status: "in_transit",
            description: "Paket dalam perjalanan ke kota tujuan.",
            occurred_at: "2025-11-01T12:30:00Z",
          },
        ],
      },
      buyer_notes: "",
      seller_notes: "Pesanan sudah dikemas dengan baik.",
      actions: {
        mark_as_processing: false,
        mark_as_shipped: false,
        mark_as_delivered: true,
        cancel_order: false,
        print_invoice: true,
      },
    },
  ],
  order_statistics: {
    total_orders: 25,
    pending: 5,
    processing: 8,
    shipped: 7,
    completed: 4,
    canceled: 1,
    total_revenue: 1200000.0,
    average_order_value: 48000.0,
  },
  activity_log: [
    {
      id: 1,
      type: "update_order_status",
      description: "Pesanan ORD-20251101-001 diubah menjadi 'processing'.",
      timestamp: "2025-11-01T02:00:00Z",
    },
    {
      id: 2,
      type: "shipment_created",
      description: "Pengiriman dibuat untuk pesanan ORD-20251031-087 via JNT Express.",
      timestamp: "2025-11-01T03:00:00Z",
    },
  ],
};

export default function OrderManagementPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [showShipmentModal, setShowShipmentModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      processing: "bg-blue-100 text-blue-700 border-blue-300",
      shipped: "bg-purple-100 text-purple-700 border-purple-300",
      delivered: "bg-green-100 text-green-700 border-green-300",
      completed: "bg-green-100 text-green-700 border-green-300",
      canceled: "bg-red-100 text-red-700 border-red-300",
      returned: "bg-orange-100 text-orange-700 border-orange-300",
    };
    return styles[status] || styles.pending;
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      unpaid: "bg-red-100 text-red-700 border-red-300",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      paid: "bg-green-100 text-green-700 border-green-300",
      refunded: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: "⏳",
      processing: "🔄",
      shipped: "🚚",
      delivered: "✅",
      completed: "✅",
      canceled: "❌",
      returned: "↩️",
    };
    return icons[status] || "📦";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>🛒</span>
            <span>Manajemen Pesanan</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola dan pantau semua pesanan dari pelanggan Anda</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2">
            <span>📊</span>
            <span>Ekspor Data</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
        {[
          {
            label: "Total Pesanan",
            value: orderData.order_statistics.total_orders,
            icon: "📦",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Menunggu",
            value: orderData.order_statistics.pending,
            icon: "⏳",
            color: "from-yellow-400 to-orange-500",
          },
          {
            label: "Diproses",
            value: orderData.order_statistics.processing,
            icon: "🔄",
            color: "from-blue-400 to-indigo-500",
          },
          {
            label: "Dikirim",
            value: orderData.order_statistics.shipped,
            icon: "🚚",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Selesai",
            value: orderData.order_statistics.completed,
            icon: "✅",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Dibatalkan",
            value: orderData.order_statistics.canceled,
            icon: "❌",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Total Pendapatan",
            value: formatCurrency(orderData.order_statistics.total_revenue),
            icon: "💰",
            color: "from-green-400 to-teal-500",
            isLarge: true,
          },
          {
            label: "Rata-rata Pesanan",
            value: formatCurrency(orderData.order_statistics.average_order_value),
            icon: "📈",
            color: "from-orange-400 to-red-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
              stat.isLarge ? "col-span-2" : ""
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{stat.icon}</span>
              <p
                className={`font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                  stat.isLarge ? "text-xl" : "text-2xl"
                }`}
              >
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
                placeholder="Cari pesanan berdasarkan nomor order atau nama pembeli..."
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
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "Semua", icon: "📦" },
              { id: "pending", label: "Menunggu", icon: "⏳" },
              { id: "processing", label: "Diproses", icon: "🔄" },
              { id: "shipped", label: "Dikirim", icon: "🚚" },
              { id: "completed", label: "Selesai", icon: "✅" },
              { id: "canceled", label: "Batal", icon: "❌" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  filterStatus === filter.id
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

      {/* Orders List */}
      <div className="space-y-4 animate-fade-in">
        {orderData.orders.map((order) => (
          <div
            key={order.order_shop_id}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 border-b-2 border-orange-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-amber-900">{order.order_number}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusBadge(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPaymentStatusBadge(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status === "paid" ? "💳 Dibayar" : "⏳ Belum Bayar"}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      {new Date(order.order_date).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-amber-700">{order.items.length} item</p>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="p-4 space-y-4">
              {/* Buyer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👤</span>
                    <p className="font-bold text-amber-900">Informasi Pembeli</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-amber-800">
                      <strong>Nama:</strong> {order.buyer_name}
                    </p>
                    <p className="text-amber-800">
                      <strong>Kontak:</strong> {order.buyer_contact}
                    </p>
                    {order.buyer_notes && (
                      <p className="text-amber-800 mt-2">
                        <strong>📝 Catatan:</strong> {order.buyer_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📍</span>
                    <p className="font-bold text-amber-900">Alamat Pengiriman</p>
                  </div>
                  <div className="space-y-1 text-sm text-amber-800">
                    <p>
                      <strong>{order.shipping_address.recipient_name}</strong>
                    </p>
                    <p>{order.shipping_address.phone}</p>
                    <p>{order.shipping_address.address_line1}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <span>📦</span>
                  <span>Produk Dipesan</span>
                </p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        🥫
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-amber-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-amber-700">SKU: {item.product_sku}</p>
                        <p className="text-sm text-amber-800">
                          {formatCurrency(item.price)} x {item.quantity} = <strong>{formatCurrency(item.total)}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipment Tracking */}
              {order.shipment_info.tracking_number && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-blue-900 flex items-center gap-2">
                      <span>🚚</span>
                      <span>Tracking Pengiriman</span>
                    </p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {order.shipment_info.carrier_name} - {order.shipment_info.service_code}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Nomor Resi:</strong> {order.shipment_info.tracking_number}
                  </p>

                  {/* Tracking Timeline */}
                  {order.shipment_info.events.length > 0 && (
                    <div className="space-y-2">
                      {order.shipment_info.events.map((event, idx) => (
                        <div key={event.event_id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 pb-2 border-b border-blue-200 last:border-0">
                            <p className="font-semibold text-blue-900">{event.description}</p>
                            <p className="text-xs text-blue-700">
                              {new Date(event.occurred_at).toLocaleString("id-ID", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-amber-700">Subtotal</p>
                  <p className="font-bold text-amber-900">{formatCurrency(order.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-700">Diskon</p>
                  <p className="font-bold text-green-600">-{formatCurrency(order.discount_total)}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-700">Ongkir ({order.shipping_method})</p>
                  <p className="font-bold text-amber-900">{formatCurrency(order.shipping_cost)}</p>
                </div>
                <div>
                  <p className="text-sm text-amber-700">Total Pembayaran</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-200">
                {order.actions.mark_as_processing && (
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <span>🔄</span>
                    <span>Proses Pesanan</span>
                  </button>
                )}
                {order.actions.mark_as_shipped && (
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2">
                    <span>🚚</span>
                    <span>Tandai Dikirim</span>
                  </button>
                )}
                {order.actions.mark_as_delivered && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors flex items-center gap-2">
                    <span>✅</span>
                    <span>Pesanan Selesai</span>
                  </button>
                )}
                {order.actions.print_invoice && (
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <span>🖨️</span>
                    <span>Cetak Invoice</span>
                  </button>
                )}
                {order.actions.cancel_order && (
                  <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors flex items-center gap-2">
                    <span>❌</span>
                    <span>Batalkan</span>
                  </button>
                )}
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <span>💬</span>
                  <span>Chat Pembeli</span>
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
          <h2 className="text-xl font-bold text-amber-900">Aktivitas Pesanan Terbaru</h2>
        </div>

        <div className="space-y-3">
          {orderData.activity_log.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center text-white font-bold shrink-0">
                {activity.type === "update_order_status"
                  ? "🔄"
                  : activity.type === "shipment_created"
                  ? "🚚"
                  : activity.type === "payment_confirmed"
                  ? "💳"
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
