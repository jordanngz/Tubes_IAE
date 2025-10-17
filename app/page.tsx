import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import ProductGrid from "@/components/product-grid"
import PromoSection from "@/components/promo-section"
import CategoryCarousel from "@/components/category-carousel"
import FeaturedCarousel from "@/components/featured-carousel"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full">
        <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-white">
          <div className="w-full px-4 py-8 lg:py-12">
            <section className="space-y-8 lg:space-y-12">
              <Hero />
              <FeaturedCarousel />
              <CategoryCarousel />
              <PromoSection />
              <ProductGrid />
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
