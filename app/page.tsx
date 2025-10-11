import { Navbar } from "@/components/canned/navbar"
import { Hero } from "@/components/canned/hero"
import { ProductCarousel } from "@/components/canned/product-carousel"

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProductCarousel />
    </main>
  )
}
