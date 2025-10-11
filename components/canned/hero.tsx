"use client"

import type React from "react"

import Image from "next/image"
import { CircleHelp, HeartHandshake, Soup, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="gradient-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
        {/* Copy */}
        <div className="space-y-5">
          <h1 className="text-3xl md:text-5xl font-black text-pretty">
            Temukan berbagai <span className="text-brand-strong">varian makanan</span> kaleng{" "}
            <span className="text-brand-strong">favorit Anda.</span>
          </h1>

          <p className="text-base leading-relaxed text-foreground/80">
            Canned It menghadirkan beragam pilihan makanan kaleng mulai dari daging, ikan, sayuran, hingga olahan siap
            santap. Semua produk diproses dengan teknologi modern, menjaga kesegaran, rasa, dan kandungan gizi agar
            tetap terjaga sampai ke meja makan Anda.
          </p>

          <div className="text-sm font-semibold text-brand-strong space-y-1">
            <p>“Rasa Terjaga, Siap Santap”</p>
            <p>“Setiap Kaleng, Penuh Nutrisi”</p>
          </div>

          <Button className="bg-brand-strong hover:bg-brand text-white px-6 py-6 rounded-full text-lg w-fit soft-shadow">
            VIEW MENU
          </Button>

          {/* Feature icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <Feature icon={<HeartHandshake />} label="Bahan lokal" />
            <Feature icon={<Soup />} label="Rasa segar" />
            <Feature icon={<ShieldCheck />} label="Aman & terjaga" />
            <Feature icon={<CircleHelp />} label="Pesan online" />
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-white/60 blur-2xl" aria-hidden />
          <div className="relative rounded-full ring-gold soft-shadow overflow-hidden">
           <Image
            src="/plate-of-beef-rendang-with-cucumber.jpg"
            alt="Canned It Beef Rendang"
            width={520}
            height={520}
          />
          </div>

          {/* Small card under the image */}
          <div className="mt-5 max-w-md rounded-2xl bg-white/90 p-4 soft-shadow">
            <p className="text-sm font-bold">
              Canned it <span className="text-brand-strong">Beef rendang</span>{" "}
              <span className="ml-2 px-2 py-0.5 rounded bg-brand/10 text-brand text-xs">10k Reviews</span>
            </p>
            <div className="mt-2 flex items-center gap-1 text-brand-strong">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span className="ml-2 text-xs text-foreground/70">10k Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-white/80 p-3 soft-shadow">
      <div className="h-10 w-10 grid place-items-center rounded-full bg-white ring-gold text-brand-strong">{icon}</div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}
