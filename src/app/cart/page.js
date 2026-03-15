"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

function money(v) {
  return `INR ${Math.round(v)}`;
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, summary } = useCart();

  return (
    <main className="page-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">

        {/* Page header */}
        <div className="mb-8 fade-up">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,191,36,0.7)" }}>
            Your Order
          </p>
          <h1 className="text-4xl font-black" style={{ color: "#f5e6d3" }}>
            Cart {cart.length > 0 && <span className="gradient-text">({summary.itemCount} items)</span>}
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl py-20 text-center fade-up"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-2xl"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
              CART
            </div>
            <p className="text-xl font-bold" style={{ color: "#f5e6d3" }}>Your cart is empty</p>
            <p className="mt-2 text-sm" style={{ color: "rgba(245,230,211,0.5)" }}>
              Add something delicious from our menu.
            </p>
            <Link href="/"
              className="btn-amber mt-6 inline-block px-7 py-3 text-sm font-black shadow-lg shadow-orange-500/25">
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* Cart items */}
            <div className="space-y-4 fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: "rgba(245,230,211,0.5)" }}>
                  {cart.length} item{cart.length > 1 ? "s" : ""} in your order
                </p>
                <button onClick={clearCart}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
                  Clear All
                </button>
              </div>

              {cart.map((item, i) => (
                <article key={item.id}
                  className="flex items-center gap-4 rounded-2xl p-4 fade-up card-lift"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    animationDelay: `${i * 60}ms`,
                  }}>
                  {/* Image */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold" style={{ color: "#f5e6d3" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "rgba(245,230,211,0.45)" }}>{item.category}</p>
                    <p className="mt-1 text-sm font-black gradient-text">INR {item.price} each</p>
                  </div>

                  {/* Qty + remove */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-lg font-bold transition hover:bg-white/10"
                        style={{ color: "#f5e6d3" }}>
                        -
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-bold" style={{ color: "#f5e6d3" }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-lg font-bold transition hover:bg-white/10"
                        style={{ color: "#fbbf24" }}>
                        +
                      </button>
                    </div>

                    <p className="text-xs font-black" style={{ color: "#fbbf24" }}>
                      INR {item.price * item.quantity}
                    </p>

                    <button onClick={() => removeFromCart(item.id)}
                      className="text-[11px] font-semibold underline-offset-2 hover:underline"
                      style={{ color: "rgba(252,165,165,0.7)" }}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Checkout sidebar */}
            <aside className="h-fit fade-up-d1">
              <div className="sticky top-24 rounded-2xl p-6 space-y-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <h2 className="text-xl font-black" style={{ color: "#f5e6d3" }}>Bill Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between" style={{ color: "rgba(245,230,211,0.65)" }}>
                    <span>Item Total</span>
                    <span className="font-semibold" style={{ color: "#f5e6d3" }}>{money(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: "rgba(245,230,211,0.65)" }}>
                    <span>Delivery Charges</span>
                    <span className="font-semibold" style={{ color: summary.delivery === 0 ? "#4ade80" : "#f5e6d3" }}>
                      {summary.delivery === 0 ? "FREE" : money(summary.delivery)}
                    </span>
                  </div>
                  <div className="flex justify-between" style={{ color: "rgba(245,230,211,0.65)" }}>
                    <span>GST (5%)</span>
                    <span className="font-semibold" style={{ color: "#f5e6d3" }}>{money(summary.taxes)}</span>
                  </div>
                  <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                  <div className="flex justify-between text-lg font-black" style={{ color: "#f5e6d3" }}>
                    <span>To Pay</span>
                    <span className="gradient-text">{money(summary.total)}</span>
                  </div>
                </div>

                {summary.subtotal < 499 && (
                  <div className="rounded-xl p-3 text-xs font-semibold text-center"
                    style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", color: "rgba(251,191,36,0.85)" }}>
                    Add INR {499 - Math.round(summary.subtotal)} more for FREE delivery!
                  </div>
                )}

                <button className="btn-amber w-full py-4 text-sm font-black shadow-xl shadow-orange-500/30 pulse-glow">
                  Place Order - {money(summary.total)}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs"
                  style={{ color: "rgba(245,230,211,0.4)" }}>
                  <span>LOCK</span>
                  <span>Secure checkout - 256-bit encrypted</span>
                </div>

                <Link href="/"
                  className="block text-center text-xs font-semibold underline-offset-2 hover:underline"
                  style={{ color: "rgba(251,191,36,0.6)" }}>
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}