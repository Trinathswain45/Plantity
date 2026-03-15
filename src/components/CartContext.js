"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("plantity_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("plantity_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) {
        return prev.map((e) =>
          e.id === item.id ? { ...e, quantity: e.quantity + 1 } : e,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const summary = useMemo(() => {
    const itemCount = cart.reduce((t, i) => t + i.quantity, 0);
    const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const delivery = subtotal > 0 ? 49 : 0;
    const taxes = Math.round(subtotal * 0.05);
    const total = subtotal + delivery + taxes;
    return { itemCount, subtotal, delivery, taxes, total };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, summary }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
