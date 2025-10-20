import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import {AuthProvider} from "@/lib/auth-context"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Canned It — Khusus Kaleng",
  description: "Platform e-commerce khusus produk kaleng berkualitas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${geistSans.className} antialiased bg-gradient-to-br from-[#fff5f5] via-[#ffe0cc] to-[#ffc6a3]`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}