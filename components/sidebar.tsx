export default function Sidebar() {
  const menuItems = [
    { label: "Beranda", active: true },
    { label: "Kategori Kaleng" },
    { label: "Promo" },
    { label: "Produk" },
    { label: "Pesanan" },
    { label: "Pelanggan" },
    { label: "Analitik" },
    { label: "Pengaturan" },
  ]

  return (
    <aside className="hidden lg:block sticky top-20 h-fit">
      <nav className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 space-y-1">
        <p className="text-xs font-bold text-slate-600 px-3 py-2">Menu</p>
        {menuItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`block px-3 py-2 rounded-lg transition-colors ${
              item.active ? "bg-green-50 text-green-700 font-semibold" : "text-slate-700 hover:bg-amber-50"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
