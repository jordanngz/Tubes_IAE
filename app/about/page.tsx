"use client"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Tentang Canned It</h1>

        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Misi Kami</h2>
            <p className="text-slate-600 leading-relaxed">
              Canned It berkomitmen untuk menyediakan produk kaleng berkualitas tinggi dengan harga terjangkau. Kami
              percaya bahwa setiap orang berhak mendapatkan makanan bergizi dan lezat tanpa harus mengorbankan kualitas.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Visi Kami</h2>
            <p className="text-slate-600 leading-relaxed">
              Menjadi platform e-commerce terpercaya untuk produk kaleng di Indonesia, dengan menyediakan berbagai
              pilihan produk dari brand ternama dan lokal.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Mengapa Memilih Kami?</h2>
            <ul className="space-y-2 text-slate-600">
              <li>✓ Produk original dan terjamin kualitasnya</li>
              <li>✓ Harga kompetitif dan sering ada promo</li>
              <li>✓ Pengiriman cepat dan aman</li>
              <li>✓ Layanan pelanggan responsif</li>
              <li>✓ Kemudahan pembayaran dengan berbagai metode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
