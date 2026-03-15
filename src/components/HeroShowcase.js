export default function HeroShowcase() {
  const dishes = [
    {
      emoji: "PIZZA",
      name: "Wood-Fired Pizza",
      tag: "Chef's Pick",
      color: "from-orange-500/20 to-red-500/10",
      border: "rgba(249,115,22,0.25)",
    },
    {
      emoji: "BURGER",
      name: "Gourmet Burger",
      tag: "Bestseller",
      color: "from-amber-500/20 to-orange-500/10",
      border: "rgba(251,191,36,0.25)",
    },
    {
      emoji: "NOODLES",
      name: "Asian Noodles",
      tag: "New",
      color: "from-yellow-500/15 to-amber-500/10",
      border: "rgba(234,179,8,0.2)",
    },
  ];

  const stats = [
    { value: "50+", label: "Menu Items" },
    { value: "25 min", label: "Avg Delivery" },
    { value: "4.9*", label: "Avg Rating" },
    { value: "10k+", label: "Happy Orders" },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl fade-up"
      style={{
        background: "linear-gradient(135deg, rgba(180,83,9,0.12) 0%, rgba(120,53,15,0.08) 40%, rgba(10,7,5,0.95) 100%)",
        border: "1px solid rgba(251,191,36,0.12)",
        padding: "3rem 2.5rem",
      }}
    >
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-10 left-0 h-60 w-60 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)" }} />

      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        {/* Left - copy */}
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block pulse-glow" />
            Now Accepting Orders
          </div>

          <h1 className="text-5xl font-black leading-[1.08] lg:text-6xl xl:text-7xl" style={{ color: "#f5e6d3" }}>
            Food That{" "}
            <span className="gradient-text">Feels</span>
            <br />Like a Hug
          </h1>

          <p className="max-w-lg text-base leading-relaxed" style={{ color: "rgba(245,230,211,0.6)" }}>
            Chef-crafted dishes, delivered hot to your door. Browse our curated menu, build your perfect order, and track it live.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#menu"
              className="btn-amber inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl shadow-orange-500/25">
              Explore Menu
            </a>
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(245,230,211,0.8)" }}>
              Free delivery above Rs 499
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 border-t pt-7" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black gradient-text">{s.value}</p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(245,230,211,0.45)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right - dish cards stack */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto h-[380px] w-[340px]">
            {dishes.map((dish, i) => (
              <div
                key={dish.name}
                className={`absolute rounded-2xl bg-gradient-to-br ${dish.color} p-5 card-lift`}
                style={{
                  border: `1px solid ${dish.border}`,
                  top: `${i * 55}px`,
                  left: `${i * 20}px`,
                  width: "260px",
                  backdropFilter: "blur(12px)",
                  animationDelay: `${i * 0.5}s`,
                  animation: `float ${6 + i}s ${i * 1.5}s ease-in-out infinite`,
                }}
              >
                <div className="mb-3 text-5xl">{dish.emoji}</div>
                <p className="font-black text-lg" style={{ color: "#f5e6d3" }}>{dish.name}</p>
                <div className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                  {dish.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}