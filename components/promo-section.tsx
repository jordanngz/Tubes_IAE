import Image from "next/image";

export default function PromoSection() {
  return (
    <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Promo Card 1 */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full mb-4">NEW</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">PROMO SETIAP HARI</h3>
          <p className="text-slate-600 text-sm mb-6">CANNED IT KEPTLING UNTUK MENEMANI HARI JOMBLO MU</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-red-600">Rp35.000</p>
            </div>
            <Image
              src="/kepiting.jpg"
              alt="Promo"
              className="w-20 h-20 object-cover"
              width={80}
              height={80}
            />
          </div>
        </div>

        {/* Promo Card 2 */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-8 shadow-sm text-white hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <h3 className="text-2xl font-bold mb-2">OTHER FLAVOURS</h3>
          <p className="text-orange-100 text-sm mb-6">CANNED IT KORNET SAPI MENEMANI MU</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">Rp35.000</p>
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center">
              <Image
                src="/corned_beef_tp.png"
                alt="Corned Beef"
                className="w-20 h-20 object-cover"
                width={80}
                height={80}
              />
            </div>
          </div>
        </div>

        {/* Promo Card 3 */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <Image
            src="/map_background.avif"
            alt="Map Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-white/50 z-5" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">FIND A CANNED IT NEAR YOU</h3>
            <p className="text-slate-600 text-sm">Temukan toko terdekat kami</p>
          </div>
        </div>
      </div>
    </section>
  )
}
