"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { summary: { itemCount } } = useCart();
  const { user, token, openAuth, signOut } = useAuth();
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!token) {
      setProfileName("");
      return;
    }

    let cancelled = false;
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setProfileName(data?.profile?.name || "");
        }
      } catch {}
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const displayName = useMemo(() => {
    if (profileName?.trim()) return profileName.trim();
    if (user?.email) return user.email.split("@")[0];
    if (user?.phone) return user.phone;
    return "Guest";
  }, [profileName, user?.email, user?.phone]);

  const profileInitial = displayName.trim().charAt(0).toUpperCase();

  const links = [
    { href: "/", label: "Menu" },
    { href: "/cart", label: "Cart", count: itemCount },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 nav-shell">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11">
            <Image
              src="/images/plantity-logo.svg"
              alt="Plantity logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl shadow-xl shadow-black/50 logo-anim"
              priority
            />
          </div>
          <div>
            <p className="text-[1.1rem] font-semibold tracking-wide" style={{ color: "#efe7d6" }}>
              Plantity
            </p>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em]" style={{ color: "rgba(99,102,241,0.8)" }}>
              Atelier Delivery
            </p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 rounded-full p-1 md:flex"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {links.map(({ href, label, count }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200"
                style={active
                  ? { background: "linear-gradient(135deg,#67e8f9,#2dd4bf,#6366f1)", color: "#0b0b0d", fontWeight: 800 }
                  : { color: "rgba(239,231,214,0.7)" }
                }
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                    style={{ background: active ? "rgba(0,0,0,0.25)" : "linear-gradient(135deg,#67e8f9,#2dd4bf)", color: "#0b0b0d" }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold md:flex chip-glow"
            style={{ background: "rgba(99,102,241,0.12)", color: "#67e8f9", border: "1px solid rgba(99,102,241,0.2)" }}>
            <span className="h-2 w-2 rounded-full bg-green-400 pulse-glow inline-block" />
            Open - Delivers in 25-35 min
          </div>
          {user ? (
            <div className="flex items-center gap-3 rounded-full px-3 py-2 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "#efe7d6", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black"
                style={{ background: "linear-gradient(135deg,#67e8f9,#2dd4bf)", color: "#0b0b0d" }}>
                {profileInitial}
              </div>
              <div className="flex flex-col">
                <span>{displayName}</span>
                <button onClick={signOut} className="text-[10px] font-bold uppercase"
                  style={{ color: "rgba(239,231,214,0.7)" }}>
                  Sign out
                </button>
              </div>
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





