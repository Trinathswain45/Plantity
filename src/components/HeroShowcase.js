import Image from "next/image";

export default function HeroShowcase() {
  const stats = [
    { value: "4.9", label: "Average Rating" },
    { value: "25-35 min", label: "Delivery Window" },
    { value: "70+", label: "Premium Dishes" },
  ];

  return (
    <section className="hero-shell hero-3d-wrap fade-up">
      <div className="hero-grid" />
      <div className="hero-orb hero-orb--top" />
      <div className="hero-orb hero-orb--bottom" />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7">
          <div className="badge-pill">
            <span className="badge-dot" />
            Easy way to order food
          </div>

          <h1 className="hero-title">
            Order Tasty &amp; <span className="hero-accent">Fresh Food</span>
            <br />
            <span className="hero-accent-hot">anytime!</span>
          </h1>

          <p className="hero-subtitle">
            Crave-worthy bowls, pastas, and grills made fresh every day. Customize, track, and enjoy your favorites in
            a few taps.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#menu" className="btn-hot inline-flex items-center gap-2 px-7 py-3.5 text-sm font-black">
              Order Now
            </a>
            <a href="#menu" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
              See Menu
            </a>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {stats.map((s) => (
              <div key={s.label} className="stat-chip">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm mt-10 lg:mt-0">
          <div className="hero-plate hero-3d hero-parallax">
            <div className="hero-spark hero-spark--a" />
            <div className="hero-spark hero-spark--b" />
            <div className="hero-ring" />
            <Image
              src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80"
              alt="Signature bowl"
              fill
              sizes="(max-width: 1024px) 80vw, 420px"
              className="hero-img"
              priority
            />
          </div>

          <div className="chip chip--rating float-slow">
            <span className="chip-dot" />
            <span className="chip-title">Top Rated</span>
            <span className="chip-sub">4.9 average</span>
          </div>
          <div className="chip chip--delivery float-slow delay-1">
            <span className="chip-dot" />
            <span className="chip-title">Fast Delivery</span>
            <span className="chip-sub">25-35 min</span>
          </div>
          <div className="chip chip--new float-slow delay-2">
            <span className="chip-dot" />
            <span className="chip-title">Chef Special</span>
            <span className="chip-sub">Limited today</span>
          </div>

          <div className="avatar-stack float-slow delay-3">
            <span className="chip-dot chip-dot--mint" />
            {["AL", "MK", "RS", "NJ"].map((initials) => (
              <span key={initials} className="avatar-pill">
                {initials}
              </span>
            ))}
            <span className="avatar-label">1.2k+ orders today</span>
          </div>
        </div>
      </div>
    </section>
  );
}




