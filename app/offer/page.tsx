"use client"

export default function OffersPage() {
  const offers = [
    { id: 1, title: "Diskon 30% Ayam Kaleng", desc: "Semua varian ayam kaleng", discount: "30%" },
    { id: 2, title: "Beli 2 Gratis 1", desc: "Untuk produk pilihan", discount: "BOGO" },
    { id: 3, title: "Cashback 20%", desc: "Minimal pembelian Rp100.000", discount: "20%" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Penawaran Spesial</h1>
        <p className="text-slate-600 mb-8">Dapatkan penawaran terbaik kami</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="text-4xl font-bold mb-2">{offer.discount}</div>
              <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
              <p className="text-green-100">{offer.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
