"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { summary: { itemCount } } = useCart();
  const { user, openAuth, signOut } = useAuth();

  const links = [
    { href: "/", label: "Menu" },
    { href: "/cart", label: "Cart", count: itemCount },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07]" style={{ background: "rgba(10,7,5,0.85)", backdropFilter: "blur(24px)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl btn-amber text-base font-black shadow-lg shadow-orange-500/20">
            <span className="relative z-10">PL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 15c6-1 9-5 12-11 1 7-2 14-9 16-3 1-6-1-6-5 0-3 1-5 3-7" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-[1.1rem] font-black tracking-wide" style={{ color: "#f5e6d3" }}>
                Plantity
              </p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(251,191,36,0.7)" }}>
                Premium Delivery
              </p>
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {links.map(({ href, label, count }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200"
                style={active
                  ? { background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#0a0705", fontWeight: 800 }
                  : { color: "rgba(245,230,211,0.65)" }
                }
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                    style={{ background: active ? "rgba(0,0,0,0.25)" : "linear-gradient(135deg,#f59e0b,#f97316)", color: active ? "#0a0705" : "#0a0705" }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: "rgba(251,191,36,0.08)", color: "rgba(251,191,36,0.9)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <span className="h-2 w-2 rounded-full bg-green-400 pulse-glow inline-block" />
            Open - Delivers in 25-35 min
          </div>
          {user ? (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
              <span>{user.email || user.phone}</span>
              <button onClick={signOut} className="text-[10px] font-bold uppercase" style={{ color: "rgba(245,230,211,0.7)" }}>
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={openAuth} className="btn-amber px-4 py-2 text-xs font-black">
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
