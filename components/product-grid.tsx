import Image from "next/image";

export default function ProductGrid() {
  const products = [
    { id: 1, name: "Ayam Chicken", category: "Daging Unggas", image: "/ayam_kaleng.jpg", price: "Rp 25.000" },
    { id: 2, name: "Sapi Beef", category: "Daging Sapi", image: "/corned_beef.jpeg", price: "Rp 35.000" },
    { id: 3, name: "Ikan Fish", category: "Ikan & Seafood", image: "/ikan_kaleng.jpeg", price: "Rp 28.000" },
    { id: 4, name: "Sayur Veggie", category: "Sayuran", image: "/sayur_kaleng.jpg", price: "Rp 18.000" },
    { id: 5, name: "Kornet Sapi", category: "Daging Sapi", image: "/corned_beef.jpeg", price: "Rp 32.000" },
    { id: 6, name: "Sarden Kaleng", category: "Ikan & Seafood", image: "/ikan_kaleng.jpeg", price: "Rp 22.000" },
    { id: 7, name: "Buah Kaleng", category: "Buah-buahan", image: "/sayur_kaleng.jpg", price: "Rp 20.000" },
    { id: 8, name: "Jamur Kaleng", category: "Sayuran", image: "/sayur_kaleng.jpg", price: "Rp 15.000" },
  ]

  return (
    <section className="animate-fade-up w-full" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold text-amber-900">Produk Pilihan</h3>
        <button className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all">
          Lihat Semua
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {products.map((product) => (
          <article
            key={product.id}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border border-orange-100"
          >
            <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <p className="font-bold text-amber-900 text-sm">{product.name}</p>
              <p className="text-xs text-amber-700">Kategori: {product.category}</p>
              <p className="text-sm font-semibold text-orange-600">{product.price}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
