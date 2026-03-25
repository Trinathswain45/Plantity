"use client";

import { useMemo, useState } from "react";
import FoodCard from "@/components/FoodCard";
import HeroShowcase from "@/components/HeroShowcase";
import { categories, foodItems } from "@/data/FoodItems";

const FEATURES = [
  {
    icon: "DEL",
    title: "Lightning Fast Delivery",
    desc: "Hot food at your door in 25-35 minutes, every time.",
    color: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.2)",
  },
  {
    icon: "CHEF",
    title: "Chef-Crafted Recipes",
    desc: "Every dish is made by trained chefs using premium ingredients.",
    color: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.18)",
  },
  {
    icon: "LIVE",
    title: "Live Order Tracking",
    desc: "Track your order from kitchen to doorstep in real time.",
    color: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.18)",
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
        <div className="grid gap-4 sm:grid-cols-3 fade-up-d1">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4 rounded-2xl p-5 card-lift"
              style={{ background: f.color, border: `1px solid ${f.border}` }}>
              <span className="text-3xl">{f.icon}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: "#f5e6d3" }}>{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(245,230,211,0.55)" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Menu section */}
        <section id="menu" className="space-y-7 fade-up-d2">
          {/* Section header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,191,36,0.7)" }}>
                Our Menu
              </p>
              <h2 className="text-3xl font-black md:text-4xl" style={{ color: "#f5e6d3" }}>
                What Would You Like?
              </h2>
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
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
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
            <div className="rounded-2xl py-20 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-4xl mb-3">NO</p>
              <p className="font-semibold" style={{ color: "rgba(245,230,211,0.6)" }}>
                No dishes match your search.
              </p>
              <button onClick={() => { setQuery(""); setActiveCategory("All"); }}
                className="mt-4 text-sm font-bold underline underline-offset-2" style={{ color: "#fbbf24" }}>
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Bottom CTA banner */}
        <section className="relative overflow-hidden rounded-3xl px-8 py-12 text-center fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(180,83,9,0.25) 0%, rgba(120,53,15,0.15) 100%)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}>
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />
          <h2 className="relative text-3xl font-black" style={{ color: "#f5e6d3" }}>
            Hungry? Order in <span className="gradient-text">30 Minutes</span>
          </h2>
          <p className="relative mt-2 text-sm" style={{ color: "rgba(245,230,211,0.55)" }}>
            Fresh, hot, and right at your doorstep. Sign up for exclusive member deals.
          </p>
          <a href="#menu" className="btn-amber relative mt-6 inline-block px-8 py-3.5 text-sm font-black shadow-xl shadow-orange-500/30">
            Order Now
          </a>
        </section>
      </div>
    </main>
  );
}