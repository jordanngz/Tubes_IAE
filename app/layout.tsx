import type React from "react"
import type { Metadata } from "next"
import { Comic_Neue, Albert_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "CANNED IT",
  description: "Canned food catalogue and offers",
  generator: "v0.app",
}

const comic = Comic_Neue({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comic-neue",
})
const albert = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-albert-sans",
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${comic.variable} ${albert.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
