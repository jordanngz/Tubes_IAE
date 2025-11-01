"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Conversation = {
  id: string;
  buyer_id?: string | null;
  buyer_name: string;
  buyer_avatar?: string | null;
  last_message_preview?: string;
  last_message_time?: any;
  unread_count?: number;
  order_reference?: any | null;
  is_archived?: boolean;
  is_flagged?: boolean;
};

type Message = {
  id?: string;
  sender_role: "buyer" | "seller";
  content: string;
  is_read: boolean;
  sent_at: any;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_conversations: 0,
    active_today: 0,
    avg_response_time_minutes: 0,
    response_rate_percent: 0,
    unread_messages: 0,
    flagged_conversations: 0,
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConvDetail, setSelectedConvDetail] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ preferences: {}, automated_replies: [] });
  const [messageInput, setMessageInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const authFetch = async (url: string, init?: RequestInit) => {
    const idToken = user ? await user.getIdToken() : "";
    const hasBody = !!init?.body;
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${idToken}`,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      try {
        const text = await res.text();
        throw new Error(text || `${res.status}`);
      } catch (e) {
        throw new Error(`${res.status}`);
      }
    }
    return res.json();
  };

  useEffect(() => {
    let isMounted = true;
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const [sum, convs, temps, sets] = await Promise.all([
          authFetch("/api/seller/chat/summary"),
          authFetch(`/api/seller/chat/conversations?filter=${filterStatus}`),
          authFetch("/api/seller/chat/templates"),
          authFetch("/api/seller/chat/settings"),
        ]);
        if (!isMounted) return;
        setSummary(sum.communication_statistics || summary);
        setConversations((convs.conversations || []).map((c: any) => ({ ...c })));
        setTemplates(temps.templates || []);
        setSettings(sets.settings || { preferences: {}, automated_replies: [] });
        // Auto-select first conversation
        const firstId = (convs.conversations?.[0]?.id as string) || null;
        setSelectedConversationId(firstId);
      } catch (e) {
        console.error("load chat data error", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterStatus]);

  useEffect(() => {
    let active = true;
    if (!user || !selectedConversationId) return;
    (async () => {
      try {
        const data = await authFetch(`/api/seller/chat/conversations/${selectedConversationId}?limit=100`);
        if (!active) return;
        setSelectedConvDetail(data.conversation);
        setMessages(data.messages || []);
        // Mark read if there were unread
        if (data.conversation?.unread_count > 0) {
          await authFetch(`/api/seller/chat/conversations/${selectedConversationId}`, {
            method: "PATCH",
            body: JSON.stringify({ action: "mark_read" }),
          });
          // Update local state
          setConversations((prev) => prev.map((c) => (c.id === selectedConversationId ? { ...c, unread_count: 0 } : c)));
        }
      } catch (e) {
        console.error("load conversation error", e);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedConversationId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const onSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const sendMessage = async () => {
    if (!selectedConversationId || !messageInput.trim()) return;
    try {
      const res = await authFetch(`/api/seller/chat/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageInput.trim() }),
      });
      setMessages((prev) => [...prev, { id: res.id, sender_role: "seller", content: messageInput.trim(), is_read: true, sent_at: res.sent_at || new Date() }]);
      setMessageInput("");
      // Update conversation's last preview and time locally
      setConversations((prev) => prev.map((c) => (c.id === selectedConversationId ? { ...c, last_message_preview: res.content || messageInput.trim(), last_message_time: new Date() } : c)));
    } catch (e) {
      console.error("send message error", e);
    }
  };

  const saveChatSettings = async () => {
    try {
      await authFetch(`/api/seller/chat/settings`, {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setShowSettings(false);
    } catch (e) {
      console.error("save settings error", e);
    }
  };

  const getTimeAgo = (value: any) => {
    const date = value && typeof (value as any).toDate === "function" ? (value as any).toDate() : new Date(value);
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

  const selectedConv = selectedConversation;

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
            value: summary.total_conversations,
            icon: "💬",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Aktif Hari Ini",
            value: summary.active_today,
            icon: "⚡",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "Belum Dibaca",
            value: summary.unread_messages,
            icon: "🔔",
            color: "from-red-400 to-pink-500",
          },
          {
            label: "Response Rate",
            value: `${summary.response_rate_percent}%`,
            icon: "📊",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Avg Response",
            value: `${summary.avg_response_time_minutes}m`,
            icon: "⏱️",
            color: "from-purple-400 to-pink-500",
          },
          {
            label: "Ditandai",
            value: summary.flagged_conversations,
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
              {conversations.map((conv: Conversation) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-4 border-b border-orange-100 cursor-pointer transition-all duration-300 hover:bg-orange-50 ${
                    selectedConversationId === conv.id
                      ? "bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-l-orange-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {conv.buyer_name?.charAt(0) || "?"}
                      </div>
                      {(conv.unread_count || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                          {conv.unread_count || 0}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-amber-900 truncate">{conv.buyer_name}</h3>
                        <span className="text-xs text-amber-700">{getTimeAgo(conv.last_message_time || new Date())}</span>
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
                {selectedConvDetail?.order_reference && (
                  <div className="mt-3 p-3 bg-white border-2 border-orange-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Pesanan Terkait</p>
                        <p className="font-bold text-amber-900">{selectedConvDetail?.order_reference?.order_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-amber-700 mb-1">Total</p>
                        <p className="font-bold text-orange-600">
                          {formatCurrency(Number(selectedConvDetail?.order_reference?.total_amount || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/30 to-amber-50/30">
                {messages.map((message: Message, idx: number) => (
                  <div
                    key={message.id || idx}
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
                          {new Date((message as any).sent_at?.toDate ? (message as any).sent_at.toDate() : message.sent_at).toLocaleTimeString("id-ID", { timeStyle: "short" })}
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
                  <button onClick={sendMessage} className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg flex items-center justify-center transition-all shrink-0">
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
              {templates.map((template: any) => (
                <div
                  key={template.id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setMessageInput(template.content);
                    setShowTemplates(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-amber-900">{template.title}</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-300">
                      {template.is_active ? "AKTIF" : "NONAKTIF"}
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
                  {(settings.automated_replies || []).map((reply: any, idx: number) => (
                    <div
                      key={reply.auto_reply_id || reply.trigger_type || idx}
                      className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-amber-900 text-sm">
                          {reply.trigger_type === "first_message" ? "🎯 Pesan Pertama" : "🌙 Diluar Jam Operasional"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!reply.is_active}
                            onChange={(e) => {
                              const next = { ...(settings || {}) };
                              next.automated_replies = (settings.automated_replies || []).map((r: any, i: number) =>
                                i === idx ? { ...r, is_active: e.target.checked } : r
                              );
                              setSettings(next);
                            }}
                            className="sr-only peer"
                          />
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
                    { id: "sound", label: "Suara Notifikasi" },
                    { id: "desktop", label: "Notifikasi Desktop" },
                    { id: "email", label: "Email Notifikasi" },
                    { id: "archive", label: "Auto Archive (30 hari)" },
                  ].map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <span className="font-semibold text-amber-900">{pref.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!settings?.preferences?.[pref.id]}
                          onChange={(e) => setSettings((prev: any) => ({
                            ...prev,
                            preferences: { ...(prev?.preferences || {}), [pref.id]: e.target.checked },
                          }))}
                          className="sr-only peer"
                        />
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
                <button onClick={saveChatSettings} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
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
