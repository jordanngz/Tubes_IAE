"use client"

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  isPreview?: boolean
}

export default function CartModal({ isOpen, onClose, isPreview = false }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart()

  if (isPreview) {
    return (
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 mb-3">Keranjang ({totalItems} item)</h3>
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-600">
                {item.quantity}x Rp{item.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
        {items.length > 3 && <p className="text-sm text-gray-600 text-center">+{items.length - 3} produk lainnya</p>}
        <Link href="/cart">
          <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-sm">
            Lihat Keranjang
          </Button>
        </Link>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-fade-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Keranjang Belanja</h2>
                <p className="text-sm text-gray-600">{totalItems} item</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keranjang Kosong</h3>
                <p className="text-gray-600 mb-6">Belum ada produk di keranjang Anda</p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  Mulai Belanja
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-red-600 font-bold text-sm mb-2">Rp{item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="self-start w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="text-2xl font-bold text-gray-900">Rp{totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <Link href="/checkout" onClick={onClose}>
                <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-6 text-lg">
                  Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
