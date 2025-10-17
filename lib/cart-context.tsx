"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface Product {
  id: string
  name: string
  price: number
  image: string
}

export interface CartItem extends Product {
  quantity: number
  selectedVariants: Record<string, string>
}

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity: number, selectedVariants: Record<string, string>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const defaultCartContext: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
}

const CartContext = createContext<CartContextType>(defaultCartContext)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem("cart")
      if (saved) setItems(JSON.parse(saved) as CartItem[])
    } catch (e) {
      console.error("read cart:", e)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("cart", JSON.stringify(items))
    } catch (e) {
      console.error("write cart:", e)
    }
  }, [items])

  const addToCart = (product: Product, quantity: number, selectedVariants: Record<string, string>) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id)
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p))
      }
      return [...prev, { ...product, quantity, selectedVariants }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  return useContext(CartContext)
}