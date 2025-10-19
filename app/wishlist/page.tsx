"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useCart } from "@/lib/cart-context"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const router = useRouter()
  const { wishlist, removeFromWishlist, addToCart } = useCart()

  const handleAddToCart = (product: any) => {
    addToCart(product, 1, {})
    alert("Produk ditambahkan ke keranjang!")
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Wishlist Saya</h1>
          <p className="text-gray-700">Produk favorit yang Anda simpan</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-md animate-fade-in-up">
            <Heart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Kosong</h2>
            <p className="text-gray-600 mb-6">Simpan produk favorit Anda di sini</p>
            <Button
              onClick={() => router.push("/menu")}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-8 py-6"
            >
              Jelajahi Produk
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product, index) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-red-600">Rp{product.price.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Keranjang
                    </Button>
                    <Button
                      onClick={() => removeFromWishlist(product.id)}
                      variant="outline"
                      className="px-4 border-2 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
