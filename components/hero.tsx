"use client"

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-between animate-gradient overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-orange-300/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-300/30 rounded-full blur-3xl animate-float-reverse" />
        <div
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-yellow-300/25 rounded-full blur-2xl animate-float-slow animate-pulse-glow"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-44 h-44 bg-orange-400/25 rounded-full blur-3xl animate-float-reverse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/4 right-1/3 w-36 h-36 bg-red-200/20 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-float-reverse animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Left Content */}
      <div className="flex-1 max-w-xl space-y-6 text-center lg:text-left relative z-10">
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900 animate-fade-in-up text-balance">
          Temukan berbagai{" "}
          <span className="text-red-600 inline-block hover:scale-105 transition-transform duration-300">
            varian makanan
          </span>{" "}
          kaleng favorit Anda.
        </h1>

        <p className="text-slate-700 text-lg leading-relaxed animate-fade-in-up delay-200 text-pretty">
          Canned It menghadirkan beragam pilihan makanan kaleng mulai dari daging, ikan, sayuran, hingga olahan siap
          santap. Semua produk diproses dengan teknologi modern untuk menjaga kesegaran, rasa, dan kandungan gizi agar
          tetap terjaga sampai ke meja makan Anda.
        </p>

        <div className="text-slate-700 italic space-y-1 animate-fade-in-up delay-300">
          <p>"Rasa Terjaga, Siap Santap"</p>
          <p>"Setiap Kaleng, Penuh Nutrisi"</p>
        </div>

        <button className="mt-4 px-8 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:scale-95 animate-fade-in-up delay-400">
          VIEW MENU
        </button>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 justify-items-center lg:justify-items-start">
          {[
            { icon: "🛡️", label: "Bahan lokal" },
            { icon: "✨", label: "Rasa segar" },
            { icon: "✓", label: "Aman & terjaga" },
            { icon: "📦", label: "Pesan online" },
          ].map((f, idx) => (
            <div
              key={f.label}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-100 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${500 + idx * 100}ms` }}
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm font-medium text-slate-700">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Image */}
      <div className="flex-1 flex flex-col items-center lg:items-end mt-12 lg:mt-0 relative z-10">
        <div className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-full border-[10px] border-yellow-400 shadow-2xl overflow-hidden bg-white animate-fade-in-right group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 backdrop-blur-[2px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20" />

          <img
            src="/image/rendang.jpg"
            alt="Rendang Daging Sapi"
            className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-y-2 z-30">
            <p className="text-xs font-semibold text-slate-800">Premium Quality</p>
          </div>
        </div>

        <div className="text-center lg:text-left lg:pr-12 mt-5 animate-fade-in-up delay-600">
          <h3 className="font-semibold text-slate-900 text-lg hover:text-red-600 transition-colors duration-300">
            Canned It Beef Rendang
          </h3>
          <div className="flex justify-center lg:justify-start gap-1 text-red-500 mt-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="inline-block hover:scale-125 transition-transform duration-200"
                style={{ animationDelay: `${700 + i * 50}ms` }}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-slate-600 text-sm mt-1">10k Reviews</p>
        </div>
      </div>
    </section>
  )
}
