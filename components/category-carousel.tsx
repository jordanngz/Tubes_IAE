export default function CategoryCarousel() {
  const categories = [
    { name: "Ayam Chicken", image: "/canned-chicken.jpg" },
    { name: "Sapi Beef", image: "/canned-beef.jpg" },
    { name: "Ikan Fish", image: "/canned-fish.jpg" },
    { name: "Sayur Veggie", image: "/canned-vegetables.jpg" },
    { name: "Pedas Spicy", image: "/canned-spicy.jpg" },
    { name: "Campur Mix", image: "/canned-mix.jpg" },
  ]

  return (
    <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className="flex-shrink-0 flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-slate-100 group snap-center cursor-pointer"
          >
            <div className="w-24 h-24 bg-amber-50 rounded-xl overflow-hidden group-hover:bg-amber-100 transition-colors">
              <img src={cat.image || "/placeholder.svg"} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium text-slate-700 text-center">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
