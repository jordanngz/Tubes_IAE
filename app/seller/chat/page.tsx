"use client";

import { useState } from "react";

// Chat & Communication data placeholder
const chatData = {
  store_info: {
    store_id: null,
    store_name: "Nama Toko Placeholder",
    active_conversations: 3,
    unread_messages: 5,
    total_conversations: 20,
    last_active_at: "2025-11-01T10:00:00Z",
  },
  conversation_list: [
    {
      conversation_id: 1,
      buyer_id: null,
      buyer_name: "Nama Pembeli Placeholder",
      buyer_avatar: "/images/users/avatar-placeholder.jpg",
      last_message_preview: "Terima kasih ya, pesanannya sudah sampai!",
      last_message_time: "2025-11-01T09:45:00Z",
      unread_count: 1,
      order_reference: {
        order_id: null,
        order_number: "ORD-PLACEHOLDER-001",
        status: "delivered",
      },
      is_archived: false,
      is_flagged: false,
    },
    {
      conversation_id: 2,
      buyer_id: null,
      buyer_name: "Nama Pembeli Placeholder 2",
      buyer_avatar: "/images/users/avatar-placeholder-2.jpg",
      last_message_preview: "Apakah stok produknya masih ada?",
      last_message_time: "2025-11-01T08:10:00Z",
      unread_count: 0,
      order_reference: null,
      is_archived: false,
      is_flagged: false,
    },
  ],
  conversation_detail: {
    conversation_id: null,
    buyer: {
      buyer_id: null,
      name: "Nama Pembeli Placeholder",
      avatar: "/images/users/avatar-placeholder.jpg",
      joined_at: "2025-10-01T00:00:00Z",
    },
    order_reference: {
      order_id: null,
      order_number: "ORD-PLACEHOLDER-001",
      status: "shipped",
      total_amount: 85000.0,
    },
    messages: [
      {
        message_id: 1,
        sender_role: "buyer",
        sender_name: "Nama Pembeli Placeholder",
        content: "Halo, apakah produk ini masih tersedia?",
        attachments: [],
        is_read: true,
        sent_at: "2025-11-01T08:00:00Z",
      },
      {
        message_id: 2,
        sender_role: "seller",
        sender_name: "Nama Toko Placeholder",
        content: "Halo! Ya, masih tersedia. Bisa langsung checkout ya 😊",
        attachments: [],
        is_read: true,
        sent_at: "2025-11-01T08:02:00Z",
      },
      {
        message_id: 3,
        sender_role: "buyer",
        sender_name: "Nama Pembeli Placeholder",
        content: "Oke, saya checkout sekarang.",
        attachments: [],
        is_read: true,
        sent_at: "2025-11-01T08:05:00Z",
      },
    ],
  },
  communication_statistics: {
    total_conversations: 20,
    active_today: 5,
    avg_response_time_minutes: 15,
    response_rate_percent: 92.5,
    unread_messages: 5,
    flagged_conversations: 1,
  },
  quick_reply_templates: [
    {
      template_id: 1,
      title: "Terima kasih pembelian",
      content: "Terima kasih telah berbelanja di toko kami! Semoga puas dengan produk kami 😊",
      is_active: true,
    },
    {
      template_id: 2,
      title: "Pesanan dikirim",
      content: "Pesanan Anda sudah dikirim hari ini. Nomor resi akan kami kirim segera.",
      is_active: true,
    },
  ],
  automated_replies: [
    {
      auto_reply_id: 1,
      trigger_type: "first_message",
      message: "Halo! Terima kasih telah menghubungi toko kami. Kami akan membalas pesan Anda secepatnya 🙌",
      is_active: true,
    },
    {
      auto_reply_id: 2,
      trigger_type: "after_hours",
      message: "Toko kami sedang tutup. Kami akan merespon pesan Anda di jam operasional (08:00 - 20:00).",
      is_active: true,
    },
  ],
};

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}j`;
    return `${diffDays}h`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      processing: "bg-blue-100 text-blue-700 border-blue-300",
      shipped: "bg-purple-100 text-purple-700 border-purple-300",
      delivered: "bg-green-100 text-green-700 border-green-300",
      canceled: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status] || styles.pending;
  };

  const selectedConv = chatData.conversation_list.find((c) => c.conversation_id === selectedConversation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>💬</span>
            <span>Chat & Komunikasi</span>
          </h1>
          <p className="text-amber-800 mt-1">Kelola percakapan dengan pembeli Anda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
            <span>💬</span>
            <span>Quick Reply</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        {[
          {
            label: "Total Chat",
            value: chatData.communication_statistics.total_conversations,
            icon: "💬",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Aktif Hari Ini",
            value: chatData.communication_statistics.active_today,
            icon: "⚡",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "Belum Dibaca",
            value: chatData.communication_statistics.unread_messages,
            icon: "🔔",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Response Rate",
            value: `${chatData.communication_statistics.response_rate_percent}%`,
            icon: "📊",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Avg Response",
            value: `${chatData.communication_statistics.avg_response_time_minutes}m`,
            icon: "⏱️",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Ditandai",
            value: chatData.communication_statistics.flagged_conversations,
            icon: "🚩",
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

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Conversation List - Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg overflow-hidden">
            {/* Search & Filter */}
            <div className="p-4 border-b-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Cari percakapan..."
                  className="w-full px-4 py-2 pl-10 bg-white border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600">🔍</span>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "all", label: "Semua", icon: "📦" },
                  { id: "unread", label: "Belum Dibaca", icon: "🔔" },
                  { id: "flagged", label: "Ditandai", icon: "🚩" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterStatus(filter.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center gap-1 whitespace-nowrap ${
                      filterStatus === filter.id
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                        : "bg-white text-amber-900 hover:bg-orange-100"
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="h-[500px] overflow-y-auto">
              {chatData.conversation_list.map((conv) => (
                <div
                  key={conv.conversation_id}
                  onClick={() => setSelectedConversation(conv.conversation_id)}
                  className={`p-4 border-b border-orange-100 cursor-pointer transition-all duration-300 hover:bg-orange-50 ${
                    selectedConversation === conv.conversation_id
                      ? "bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-l-orange-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {conv.buyer_name.charAt(0)}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-amber-900 truncate">{conv.buyer_name}</h3>
                        <span className="text-xs text-amber-700">{getTimeAgo(conv.last_message_time)}</span>
                      </div>
                      <p className="text-sm text-amber-800 truncate mb-1">{conv.last_message_preview}</p>
                      {conv.order_reference && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-700">📦 {conv.order_reference.order_number}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                              conv.order_reference.status
                            )}`}
                          >
                            {conv.order_reference.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Flag Icon */}
                    {conv.is_flagged && <span className="text-red-500 text-lg">🚩</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Window - Right Content */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg overflow-hidden flex flex-col h-[700px]">
              {/* Chat Header */}
              <div className="p-4 border-b-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {selectedConv.buyer_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-amber-900">{selectedConv.buyer_name}</h2>
                      {selectedConv.order_reference && (
                        <p className="text-xs text-amber-700 flex items-center gap-2">
                          <span>📦 {selectedConv.order_reference.order_number}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                              selectedConv.order_reference.status
                            )}`}
                          >
                            {selectedConv.order_reference.status}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
                      <span>🚩</span>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
                      <span>📦</span>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors">
                      <span>⋮</span>
                    </button>
                  </div>
                </div>

                {/* Order Reference Card */}
                {chatData.conversation_detail.order_reference && (
                  <div className="mt-3 p-3 bg-white border-2 border-orange-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Pesanan Terkait</p>
                        <p className="font-bold text-amber-900">
                          {chatData.conversation_detail.order_reference.order_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-amber-700 mb-1">Total</p>
                        <p className="font-bold text-orange-600">
                          {formatCurrency(chatData.conversation_detail.order_reference.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/30 to-amber-50/30">
                {chatData.conversation_detail.messages.map((message) => (
                  <div
                    key={message.message_id}
                    className={`flex ${message.sender_role === "seller" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.sender_role === "seller"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-white border-2 border-orange-200 text-amber-900"
                      } rounded-2xl p-3 shadow-md hover:shadow-lg transition-all`}
                    >
                      <p className="text-sm mb-1">{message.content}</p>
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-xs ${
                            message.sender_role === "seller" ? "text-orange-100" : "text-amber-600"
                          }`}
                        >
                          {new Date(message.sent_at).toLocaleTimeString("id-ID", { timeStyle: "short" })}
                        </span>
                        {message.sender_role === "seller" && message.is_read && (
                          <span className="text-orange-100">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator (Example) */}
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-orange-200 rounded-2xl p-3 shadow-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t-2 border-orange-200 bg-white">
                <div className="flex items-end gap-2">
                  <button className="w-10 h-10 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors shrink-0">
                    <span className="text-xl">📎</span>
                  </button>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-10 h-10 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors shrink-0"
                  >
                    <span className="text-xl">💬</span>
                  </button>
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    rows={2}
                    className="flex-1 px-4 py-2 bg-orange-50 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                  />
                  <button className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg flex items-center justify-center transition-all shrink-0">
                    <span className="text-xl">📤</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl border-2 border-orange-200 rounded-2xl shadow-lg h-[700px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-5xl">
                  💬
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">Pilih Percakapan</h3>
                <p className="text-amber-700">Pilih percakapan dari daftar untuk memulai chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reply Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>💬</span>
                <span>Quick Reply Templates</span>
              </h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {chatData.quick_reply_templates.map((template) => (
                <div
                  key={template.template_id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setMessageInput(template.content);
                    setShowTemplates(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-amber-900">{template.title}</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-300">
                      AKTIF
                    </span>
                  </div>
                  <p className="text-sm text-amber-800">{template.content}</p>
                  <button className="mt-2 text-xs text-orange-600 font-semibold hover:underline">👆 Klik untuk gunakan</button>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              ➕ Tambah Template Baru
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>Pengaturan Chat</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Automated Replies */}
              <div>
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <span>🤖</span>
                  <span>Balas Otomatis</span>
                </h4>
                <div className="space-y-3">
                  {chatData.automated_replies.map((reply) => (
                    <div
                      key={reply.auto_reply_id}
                      className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-amber-900 text-sm">
                          {reply.trigger_type === "first_message" ? "🎯 Pesan Pertama" : "🌙 Diluar Jam Operasional"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={reply.is_active} className="sr-only peer" readOnly />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                        </label>
                      </div>
                      <p className="text-sm text-amber-800">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Preferences */}
              <div>
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <span>🎛️</span>
                  <span>Preferensi Chat</span>
                </h4>
                <div className="space-y-3">
                  {[
                    { id: "sound", label: "Suara Notifikasi", enabled: true },
                    { id: "desktop", label: "Notifikasi Desktop", enabled: true },
                    { id: "email", label: "Email Notifikasi", enabled: false },
                    { id: "archive", label: "Auto Archive (30 hari)", enabled: true },
                  ].map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <span className="font-semibold text-amber-900">{pref.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={pref.enabled} className="sr-only peer" readOnly />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-white border-2 border-orange-300 text-amber-900 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Batal
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  💾 Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
