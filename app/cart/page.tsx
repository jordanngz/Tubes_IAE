"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus, Trash2, Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(items.map((item) => item.id)))
  const router = useRouter()

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)))
    }
  }

  const selectedTotal = items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = () => {
    if (selectedItems.size > 0) {
      router.push("/checkout")
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Keranjang Belanja</h1>
          <p className="text-gray-700">Kelola produk yang akan Anda beli</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-32 h-32 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-6">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Keranjang Anda Kosong</h2>
            <p className="text-gray-600 mb-6">Yuk, mulai belanja produk kaleng favorit Anda!</p>
            <Link href="/menu">
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-6 text-lg">
                Mulai Belanja
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md animate-fade-in-up">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-gray-900">Pilih Semua ({items.length} Produk)</span>
                </label>
              </div>

              {/* Store Group */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md animate-fade-in-up delay-100">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={items.every((item) => selectedItems.has(item.id))}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <h3 className="font-bold text-gray-900">Canned It Official Store</h3>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"
                      />
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            {Object.entries(item.selectedVariants)
                              .map(([key, value]) => value)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-xl font-bold text-red-600 mb-3">Rp{item.price.toLocaleString("id-ID")}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-red-500 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-red-500 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button className="text-gray-600 hover:text-red-600 transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md sticky top-24 animate-fade-in-up delay-200">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Ringkasan Belanja</h3>
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Total ({selectedItems.size} produk)</span>
                    <span className="font-semibold">Rp{selectedTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                  <span>Total</span>
                  <span className="text-red-600">Rp{selectedTotal.toLocaleString("id-ID")}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Beli ({selectedItems.size})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
