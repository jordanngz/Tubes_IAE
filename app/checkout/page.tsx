"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import { useCart } from "@/lib/cart-context"
import { MapPin, Package, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Swal from "sweetalert2"

interface ShippingCost {
  service: string
  description: string
  cost: number
  etd: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, addOrder } = useCart()
  const router = useRouter()
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })
  const [selectedCourier, setSelectedCourier] = useState<ShippingCost | null>(null)
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([])
  const [selectedPayment, setSelectedPayment] = useState("")
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)

  // Mock shipping costs (in real app, this would call RajaOngkir API)
  const fetchShippingCosts = async () => {
    setIsLoadingShipping(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockCosts: ShippingCost[] = [
      { service: "JNE REG", description: "Reguler", cost: 15000, etd: "2-3 hari" },
      { service: "JNE YES", description: "Yakin Esok Sampai", cost: 25000, etd: "1 hari" },
      { service: "JNT REG", description: "Reguler", cost: 12000, etd: "2-4 hari" },
      { service: "SiCepat REG", description: "Reguler", cost: 13000, etd: "2-3 hari" },
      { service: "Ekonomi", description: "Hemat", cost: 8000, etd: "4-7 hari" },
    ]
    setShippingCosts(mockCosts)
    setSelectedCourier(mockCosts[0])
    setIsLoadingShipping(false)
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push("/menu")
    } else {
      fetchShippingCosts()
    }
  }, [items, router])

  const handlePayment = () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !selectedPayment) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Silakan lengkapi semua data pengiriman dan metode pembayaran sebelum melanjutkan.",
      })
      return
    }

    addOrder({
      items: [...items],
      totalPrice,
      shippingCost: selectedCourier?.cost || 0,
      shippingAddress,
      courier: selectedCourier?.service || "",
      paymentMethod: selectedPayment,
      status: "processing",
    })

    Swal.fire({
      icon: "success",
      title: "Pesanan Berhasil",
      text: "Pesanan Anda telah berhasil dibuat. Terima kasih telah berbelanja di Canned It!",
    })
    clearCart()
    router.push("/orders")
  }

  const shippingCost = selectedCourier?.cost || 0
  const totalWithShipping = totalPrice + shippingCost

  if (items.length === 0) return null

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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-700">Lengkapi data untuk menyelesaikan pembelian</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Alamat Pengiriman</h2>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor Telepon"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Alamat Lengkap"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Kota"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Kode Pos"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md animate-fade-in-up delay-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Produk Dipesan</h2>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
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
            </div>

            {/* Shipping Method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md animate-fade-in-up delay-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Metode Pengiriman</h2>
              {isLoadingShipping ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-600 mt-3">Memuat opsi pengiriman...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shippingCosts.map((cost) => (
                    <label
                      key={cost.service}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCourier?.service === cost.service
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="courier"
                          checked={selectedCourier?.service === cost.service}
                          onChange={() => setSelectedCourier(cost)}
                          className="w-5 h-5 text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{cost.service}</p>
                          <p className="text-sm text-gray-600">
                            {cost.description} • Estimasi {cost.etd}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-red-600">Rp{cost.cost.toLocaleString("id-ID")}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md animate-fade-in-up delay-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
              </div>
              <div className="space-y-2">
                {[
                  { id: "saldo", name: "Saldo Canned It", icon: "💰" },
                  { id: "indomaret", name: "Indomaret / Ceriamart", icon: "🏪" },
                  { id: "alfamart", name: "Alfamart / Alfamidi / Lawson / Dan+Dan", icon: "🏬" },
                  { id: "bca", name: "BCA Virtual Account", icon: "🏦" },
                ].map((payment) => (
                  <label
                    key={payment.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPayment === payment.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === payment.id}
                      onChange={() => setSelectedPayment(payment.id)}
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-2xl">{payment.icon}</span>
                    <span className="font-semibold text-gray-900">{payment.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md sticky top-24 animate-fade-in-up delay-400">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Ringkasan Transaksi</h3>
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Total Harga ({items.length} Barang)</span>
                  <span className="font-semibold">Rp{totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Total Ongkos Kirim</span>
                  <span className="font-semibold">Rp{shippingCost.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total Tagihan</span>
                <span className="text-red-600">Rp{totalWithShipping.toLocaleString("id-ID")}</span>
              </div>
              <Button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-6 text-lg"
              >
                Bayar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
