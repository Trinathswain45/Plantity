"use client";

import { useMemo, useState } from "react";
import FoodCard from "@/components/FoodCard";
import HeroShowcase from "@/components/HeroShowcase";
import { categories, foodItems } from "@/data/FoodItems";

const FEATURES = [
  {
    icon: "01",
    title: "Speedy Delivery",
    desc: "Fresh meals on your doorstep in 25-35 minutes.",
  },
  {
    icon: "02",
    title: "Fresh Ingredients",
    desc: "Chef-picked produce and premium proteins, daily.",
  },
  {
    icon: "03",
    title: "Live Order Track",
    desc: "See every step from kitchen to doorstep.",
  },
  {
    icon: "04",
    title: "Smart Offers",
    desc: "Member savings and surprise drops every week.",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchCategory = activeCategory === "All" || item.category === activeCategory;
      const text = `${item.name} ${item.description}`.toLowerCase();
      return matchCategory && text.includes(query.toLowerCase());
    });
  }, [activeCategory, query]);

  return (
    <main className="page-bg min-h-screen">
      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-8 sm:px-6">

        {/* Hero */}
        <HeroShowcase />

        {/* Features row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 fade-up-d1">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card card-lift">
              <span className="feature-icon">{f.icon}</span>
              <div>
                <p className="feature-title">{f.title}</p>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Menu section */}
        <section id="menu" className="space-y-7 fade-up-d2">
          {/* Section header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow">Our Menu</p>
              <h2 className="section-title">
                Curated Plates, Crafted Daily
              </h2>
              <p className="section-subtitle mt-2">Explore favorites, seasonal highlights, and chef specials.</p>
            </div>

            {/* Search */}
            <div className="w-full sm:w-72">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes, ingredients..."
                className="input-field"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition-all duration-200 ${
                  activeCategory === cat ? "cat-active" : "cat-idle"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item, i) => (
                <FoodCard key={item.id} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl py-20 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-4xl mb-3">NO</p>
              <p className="font-semibold" style={{ color: "rgba(239,231,214,0.6)" }}>
                No dishes match your search.
              </p>
              <button onClick={() => { setQuery(""); setActiveCategory("All"); }}
                className="mt-4 text-sm font-bold underline underline-offset-2" style={{ color: "#a7f3d0" }}>
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Bottom CTA banner */}
        <section className="relative overflow-hidden rounded-[2.5rem] px-8 py-12 text-center fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(15,118,110,0.22) 0%, rgba(11,59,58,0.16) 100%)",
            border: "1px solid rgba(15,118,110,0.2)",
          }}>
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(15,118,110,0.18) 0%, transparent 70%)" }} />
          <h2 className="relative text-3xl font-semibold" style={{ color: "#efe7d6" }}>
            Join the <span className="gradient-text">Plantity Atelier</span>
          </h2>
          <p className="relative mt-2 text-sm" style={{ color: "rgba(239,231,214,0.6)" }}>
            Priority access, signature drops, and member-only pairings. Delivered like a five-star experience.
          </p>
          <a href="#menu" className="btn-amber relative mt-6 inline-block px-8 py-3.5 text-sm font-black">
            Become a Member
          </a>
        </section>
      </div>
    </main>
  );
}


