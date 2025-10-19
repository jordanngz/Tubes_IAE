"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import { products } from "@/lib/products-data"
import { useCart } from "@/lib/cart-context"
import { Star, Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()

  const product = products.find((p) => p.id === params.id)

  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product.id))
    }
  }, [product, isInWishlist])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity, selectedVariants)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleToggleWishlist = () => {
    if (!product) return
    if (isWishlisted) {
      removeFromWishlist(product.id)
      setIsWishlisted(false)
    } else {
      addToWishlist(product)
      setIsWishlisted(true)
    }
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
          <Button onClick={() => router.push("/menu")} className="bg-gradient-to-r from-red-500 to-orange-500">
            Kembali ke Menu
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 animate-gradient relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-float-reverse" />
      </div>

      <Navbar />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in-down flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">Berhasil ditambahkan ke keranjang!</span>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors animate-fade-in-up"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Kembali</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <div className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="animate-fade-in-up delay-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating & Sales */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-900">{product.rating}</span>
                  <span className="text-gray-600">({product.reviews} rating)</span>
                </div>
                <span className="text-gray-600">Terjual {product.sold.toLocaleString("id-ID")}+</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-red-600">Rp{product.price.toLocaleString("id-ID")}</span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Variants */}
              {product.variants.map((variant) => (
                <div key={variant.name} className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{variant.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variant.name]: option,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 ${
                          selectedVariants[variant.name] === option
                            ? "border-red-500 bg-red-50 text-red-600 scale-105"
                            : "border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:scale-105"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity & Stock */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Jumlah</h3>
                  <span className="text-sm text-gray-600">Stok: {product.stock}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white rounded-lg border-2 border-gray-300 p-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    Subtotal: Rp
                    {(product.price * quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-6 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />+ Keranjang
                </Button>
                <Button
                  onClick={handleToggleWishlist}
                  variant="outline"
                  className={`px-6 py-6 border-2 transition-all ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-6 border-2 border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
              >
                Beli Langsung
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}