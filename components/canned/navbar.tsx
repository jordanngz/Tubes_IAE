"use client"

import { Search, ShoppingCart, UserRound } from "lucide-react"
import Link from "next/link"

const nav = ["HOME", "MENU", "OFFERS", "SERVICES", "ABOUT US"]

export function Navbar() {
  return (
    <header className="w-full sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href="#" className="brand-font text-2xl md:text-3xl font-normal text-brand-strong drop-shadow">
          CANNED IT
        </Link>

        <div className="ml-auto hidden md:flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-5">
            {nav.map((item, i) => (
              <Link
                key={item}
                href="#"
                className={`text-sm font-bold tracking-wide ${i === 0 ? "text-brand-strong" : "text-foreground/80"} hover:text-brand-strong transition`}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="relative hidden lg:block">
            <input
              aria-label="Search"
              placeholder="Search"
              className="w-64 rounded-full border border-border bg-transparent pl-4 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-(--brand)"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand" />
          </div>

          <button
            aria-label="Cart"
            className="h-9 w-9 rounded-full bg-brand text-white grid place-items-center soft-shadow"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            aria-label="Account"
            className="h-9 w-9 rounded-full bg-brand text-white grid place-items-center soft-shadow"
          >
            <UserRound className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
