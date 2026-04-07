"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

function StarRating({ rating }) {
  const stars = [1, 2, 3, 4, 5].map((star) => {
    if (rating >= star) return "*";
    if (rating >= star - 0.5) return "+";
    return ".";
  });

  return (
    <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(99,102,241,0.8)" }}>
      <span className="font-mono" aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
        {stars.join("")}
      </span>
      <span className="text-[11px] font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function FoodCard({ item, index = 0 }) {
  const { addToCart, cart } = useCart();
  const [adding, setAdding] = useState(false);

  const inCart = cart.find((c) => c.id === item.id);

  const handleAdd = () => {
    setAdding(true);
    addToCart(item);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <article
      className="group relative overflow-hidden rounded-3xl card-lift fade-up card-frame card-tilt"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(11,11,13,0.9) 0%, rgba(11,11,13,0.2) 55%, transparent 100%)"
          }}
        />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: "rgba(11,11,13,0.7)",
            color: "#67e8f9",
            border: "1px solid rgba(99,102,241,0.3)",
            backdropFilter: "blur(10px)"
          }}
        >
          {item.category}
        </span>
        <span
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background: "rgba(11,11,13,0.75)",
            border: "1px solid rgba(99,102,241,0.4)",
            backdropFilter: "blur(10px)"
          }}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span
          className="absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            background: "rgba(11,11,13,0.7)",
            color: "rgba(239,231,214,0.85)",
            backdropFilter: "blur(8px)"
          }}
        >
          Prep {item.prepTime}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-base font-semibold leading-snug" style={{ color: "#efe7d6" }}>
            {item.name}
          </h3>
          <p
            className="mt-1 text-xs leading-relaxed line-clamp-2"
            style={{ color: "rgba(239,231,214,0.55)" }}
          >
            {item.description}
          </p>
        </div>

        <StarRating rating={item.rating} />

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="price-text">Rs {item.price}</p>
            {inCart && (
              <p className="text-[10px] font-semibold" style={{ color: "rgba(99,102,241,0.7)" }}>
                {inCart.quantity} in cart
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="relative overflow-hidden rounded-full px-4 py-2.5 text-xs font-black transition-all duration-300"
            style={{
              background: adding
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : "linear-gradient(135deg,#67e8f9,#2dd4bf,#6366f1)",
              color: "#0b0b0d",
              boxShadow: adding
                ? "0 6px 24px rgba(34,197,94,0.45)"
                : "0 6px 24px rgba(99,102,241,0.35)",
              transform: adding ? "scale(0.96)" : "scale(1)"
            }}
          >
            {adding ? "Added!" : inCart ? "+ Add More" : "+ Add"}
          </button>
        </div>
      </div>
    </article>
  );
}





