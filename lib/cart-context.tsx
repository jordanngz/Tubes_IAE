"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "./products-data"

interface CartItem extends Product {
  quantity: number
  selectedVariants: Record<string, string>
}

interface Order {
  id: string
  items: CartItem[]
  totalPrice: number
  shippingCost: number
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  courier: string
  paymentMethod: string
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity: number, selectedVariants: Record<string, string>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  orders: Order[]
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders))
  }, [orders])

  const addToCart = (product: Product, quantity: number, selectedVariants: Record<string, string>) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }
      return [...prev, { ...product, quantity, selectedVariants }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId)
  }

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setOrders((prev) => [newOrder, ...prev])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        orders,
        addOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
