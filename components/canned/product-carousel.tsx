"use client"

import * as React from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const CATEGORIES = [
  { id: "chicken", name: "Ayam Chicken" },
  { id: "beef", name: "Sapi Beef" },
  { id: "fish", name: "Ikan Fish" },
  { id: "veggie", name: "Sayur Veggie" },
  { id: "spicy", name: "Pedas Spicy" },
  { id: "mix", name: "Campur Mix" },
]


export function ProductCarousel() {
  const [active, setActive] = React.useState(0)

  return (
    <section className="bg-[var(--cream)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Category strip with click/underline */}
        <div className="relative bg-white rounded-2xl soft-shadow px-8 py-5">
          <button
            aria-label="Previous categories"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-strong"
          >
            ‹
          </button>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {CATEGORIES.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActive(idx)}
                className="group grid gap-2 place-items-center"
                aria-pressed={active === idx}
              >
                <img src="/ayam_kaleng.jpg" alt="ayam kaleng"className="h-16 w-16 rounded-xl object-cover soft-shadow" />
                {/* <div className="h-16 w-16 rounded-xl bg-[var(--muted)] soft-shadow" /> */}
                <span className="text-xs font-semibold text-center">{c.name}</span>
                <span
                  className={`h-1 w-20 rounded-full ${active === idx ? "bg-brand-strong" : "bg-transparent"} transition-colors`}
                />
              </button>
            ))}
          </div>

          <button
            aria-label="Next categories"
            onClick={() => setActive((a) => Math.min(CATEGORIES.length - 1, a + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-strong"
          >
            ›
          </button>
        </div>

        {/* Cards area like the mock */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <PromoCard />
          <OtherFlavours />
          <FindUs />

          <BigStory />
          <UnderMaintenance />
        </div>

        {/* Optional carousel of featured tiles */}
       <div className="mt-10">
        <Carousel opts={{ align: "start" }}>
          <CarouselContent>
            {Array.from({ length: 8 }).map((_, i) => (
              <CarouselItem key={i} className="basis-3/4 sm:basis-1/3 lg:basis-1/4">
                <div className="h-60 rounded-xl bg-white soft-shadow p-4 flex flex-col items-center justify-center">
                  {/* 🖼 Tambahkan gambar di sini */}
                  <img
                    src="/ayam_kaleng.jpg"
                    alt="Ayam Kaleng"
                    className="h-24 w-24 object-cover rounded-lg mb-3"
                  />

                  {/* 🧾 Teks konten */}
                  <p className="font-bold text-center">Featured #{i + 1}</p>
                  <p className="text-sm text-foreground/70 mt-1 text-center">
                    Kategori: {CATEGORIES[(active + i) % CATEGORIES.length].name}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-white/95 text-brand-strong border-border soft-shadow" />
          <CarouselNext className="bg-white/95 text-brand-strong border-border soft-shadow" />
        </Carousel>
      </div>

      </div>
    </section>
  )
}

function PromoCard() {
  return (
    <div className="relative rounded-2xl bg-white soft-shadow p-5 gap-2">
      <span className="badge-pill absolute -top-2 -right-2 bg-brand-strong text-white">NEW</span>
      <p className="text-xl font-black leading-tight">PROMO SETIAP</p>
      <p className="text-xl font-black leading-tight -mt-0.5">HARI</p>
      <p className="text-xs mt-2">CANNED IT KEPTIING  UNTUK</p>
      <p className="text-xs -mt-1">MENEMANI HARI JOMBLO MU</p>
      <div  />
      <img src="/kepiting.jpg" alt="kepiting" className="mt-3 h-40 w-30 rounded-[32px] bg-[#E8C375]" />
      <p className="mt-3 font-bold text-brand-strong">Rp35.000</p>
    </div>
  )
}

function OtherFlavours() {
  return (
    <div className="relative rounded-2xl soft-shadow p-5" style={{ background: "#FF7747" }}>
      <p className="text-white text-xl font-black">OTHER</p>
      <p className="text-white text-xl font-black -mt-1">FLAVOURS</p>
      <p className="text-white text-xs mt-2">CANNED IT KORNET SAPI</p>
      <p className="text-white text-xs -mt-1">MENEMANI MU</p>
      <p className="text-white font-bold mt-3">Rp35.000</p>
      <div />
      <img src="pronas.jpg" alt="ayam"  className="absolute right-3 bottom-3 h-40 w-35 rounded-[32px] bg-black/10" />
    </div>
  )
}

function FindUs() {
  return (
    <div className="rounded-2xl bg-white soft-shadow p-5 grid place-content-center">
      <p className="text-lg font-black text-center leading-tight">FIND A</p>
      <p className="text-lg font-black text-center -mt-1">CANNED IT</p>
      <p className="text-lg font-black text-center -mt-1">NEAR YOU</p>
      <div  />
      <img src="/Maps.png" alt="map" className="mt-3 h-20 w-24 rounded-[32px] bg-[#D9D9D9] mx-auto"/>
    </div>
  )
}

function BigStory() {
  return (
    <div className="md:col-span-2 relative rounded-2xl bg-white soft-shadow p-5 overflow-hidden">
      <p className="text-2xl font-black leading-tight">CANNED</p>
      <p className="text-2xl font-black leading-tight">SPECIAL</p>
      <p className="text-2xl font-black leading-tight">CONDIMENTS</p>

      <span className="badge-pill mt-4 inline-block bg-gradient-to-r from-[#FF7747] to-[#FFAB8E] text-white">
        100% REAL DEMOKRASI
      </span>

      {/* 🖼 Gambar bumbu di kanan bawah */}
      <img
        src="/bumbu.png"
        alt="Bumbu Kaleng"
        className="absolute right-6 bottom-3 h-44 w-64 object-cover rounded-[48px]"
      />
    </div>

  )
}

function UnderMaintenance() {
  return (
    <div className="rounded-2xl bg-yellow-400 soft-shadow p-6 grid place-items-center">
      <p className="text-3xl font-extrabold tracking-wide">UNDER MAINTENANCE</p>
    </div>
  )
}
