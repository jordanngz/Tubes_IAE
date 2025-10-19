"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import { useCart } from "@/lib/cart-context"
import { Package, Clock, Truck, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  const router = useRouter()
  const { orders } = useCart()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "processing":
        return <Package className="w-5 h-5 text-blue-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-600" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Pembayaran"
      case "processing":
        return "Diproses"
      case "shipped":
        return "Dikirim"
      case "delivered":
        return "Selesai"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 animate-gradient relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
          <p className="text-gray-700">Riwayat transaksi dan status pesanan Anda</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-md animate-fade-in-up">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h2>
            <p className="text-gray-600 mb-6">Mulai belanja dan pesanan Anda akan muncul di sini</p>
            <Button
              onClick={() => router.push("/menu")}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-8 py-6"
            >
              Mulai Belanja
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">ID Pesanan</p>
                    <p className="font-bold text-gray-900">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="font-semibold text-sm">{getStatusText(order.status)}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-600">{item.quantity}x</p>
                        <p className="text-sm font-bold text-red-600">Rp{item.price.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold">Rp{order.totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Ongkos Kirim ({order.courier})</span>
                    <span className="font-semibold">Rp{order.shippingCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total</span>
                    <span className="text-red-600">
                      Rp{(order.totalPrice + order.shippingCost).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.name} • {order.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
