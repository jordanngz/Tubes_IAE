export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex justify-around items-center h-16 px-4 pb-safe">
        {[
          { icon: "🏠", label: "Beranda", active: true },
          { icon: "📂", label: "Kategori" },
          { icon: "🛒", label: "Keranjang" },
          { icon: "👤", label: "Profil" },
        ].map((tab) => (
          <a
            key={tab.label}
            href="#"
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              tab.active ? "text-green-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
