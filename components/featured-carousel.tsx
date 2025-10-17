"use client"

import { useState, useEffect } from "react"

export default function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const products = [
    { id: 1, name: "Ayam Chicken", image: "/ayam_kaleng.jpg", price: "Rp25.000" },
    { id: 2, name: "Sapi Beef", image: "/canned-beef.jpg", price: "Rp35.000" },
    { id: 3, name: "Ikan Fish", image: "/canned-fish.jpg", price: "Rp28.000" },
    { id: 4, name: "Sayur Veggie", image: "/canned-vegetables.jpg", price: "Rp18.000" },
    { id: 5, name: "Pedas Spicy", image: "/canned-spicy.jpg", price: "Rp30.000" },
    { id: 6, name: "Campur Mix", image: "/canned-mix.jpg", price: "Rp32.000" },
  ]

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay, products.length])

    const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
    }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  return (
    <section className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
      <div className="space-y-4">
        <div className="relative bg-white rounded-2xl shadow-md overflow-hidden w-full">
          <div className="relative h-64 lg:h-80 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
            {/* Product Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={products[currentIndex].image || "/placeholder.svg"}
                alt={products[currentIndex].name}
                className="absolute w-full h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl z-10"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl z-10"
              aria-label="Next slide"
            >
              →
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4 lg:p-6 bg-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-900">{products[currentIndex].name}</h3>
                <p className="text-base text-red-600 font-semibold mt-1">{products[currentIndex].price}</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-full font-semibold text-sm lg:text-base hover:bg-red-700 transition-all duration-200 hover:shadow-lg whitespace-nowrap">
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex ? "bg-red-600 w-6 h-2" : "bg-slate-300 hover:bg-slate-400 w-2 h-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
