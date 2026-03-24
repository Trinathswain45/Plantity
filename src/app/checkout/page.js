"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

function money(v) {
  return `₹ ${Math.round(v)}`;
}

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { cart, summary, clearCart } = useCart();
  const { token, openAuth, user } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [upiId, setUpiId] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [hasToggledProfile, setHasToggledProfile] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!token) {
        try {
          const stored = localStorage.getItem("plantity_profile");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (cancelled) return;
            setProfile((prev) => ({
              ...prev,
              ...parsed,
              email: parsed.email || user?.email || prev.email,
              phone: parsed.phone || user?.phone || prev.phone,
            }));
          } else if (!cancelled) {
            setProfile((prev) => ({
              ...prev,
              email: user?.email || prev.email,
              phone: user?.phone || prev.phone,
            }));
          }
        } catch {}
        if (!cancelled) setProfileLoaded(true);
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          const loaded = data.profile || {};
          setProfile((prev) => ({
            ...prev,
            ...loaded,
            email: loaded.email || user?.email || prev.email,
            phone: loaded.phone || user?.phone || prev.phone,
          }));
        } else if (!cancelled) {
          setProfile((prev) => ({
            ...prev,
            email: user?.email || prev.email,
            phone: user?.phone || prev.phone,
          }));
        }
      } catch {}
      if (!cancelled) setProfileLoaded(true);
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [token, user?.email, user?.phone]);

  useEffect(() => {
    if (!profileLoaded) return;

    if (!token) {
      try {
        localStorage.setItem("plantity_profile", JSON.stringify(profile));
      } catch {}
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profile),
        });
      } catch {}
    }, 600);

    return () => clearTimeout(timer);
  }, [profile, token, profileLoaded]);

  const isProfileComplete = useMemo(() => (
    profile.name &&
    profile.email &&
    profile.phone &&
    profile.address &&
    profile.city &&
    profile.pincode
  ), [profile]);

  useEffect(() => {
    if (hasToggledProfile) return;
    setShowProfileForm(!isProfileComplete);
  }, [isProfileComplete, hasToggledProfile]);

  const handlePay = async () => {
    if (!token) {
      openAuth();
      return;
    }

    if (!cart.length) {
      router.push("/cart");
      return;
    }

    if (!isProfileComplete) {
      setError("Please fill your delivery details before paying.");
      return;
    }

    if (method === "upi" && !upiId.trim()) {
      setError("Please enter a UPI ID to proceed.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (method === "stripe") {
        const res = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart,
            totals: summary,
            delivery: profile,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Checkout failed");
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error("Stripe checkout URL missing");
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          totals: summary,
          delivery: profile,
          paymentMethod: "upi",
          paymentMeta: { upiId: upiId.trim() },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      clearCart();
      const amount = Number(summary.total || 0).toFixed(2);
      const note = encodeURIComponent(`Plantity Order ${data.orderId}`);
      const upiLink = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=Plantity&am=${amount}&cu=INR&tn=${note}`;
      setSuccess("Opening your UPI app...");
      window.location.href = upiLink;
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        <div className="mb-8 fade-up">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,191,36,0.7)" }}>
            Payment
          </p>
          <h1 className="text-4xl font-black" style={{ color: "#f5e6d3" }}>
            Secure Checkout
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
              Add something delicious before checkout.
            </p>
            <Link href="/"
              className="btn-amber mt-6 inline-block px-7 py-3 text-sm font-black shadow-lg shadow-orange-500/25">
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-4 fade-up">
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-sm font-semibold" style={{ color: "rgba(245,230,211,0.5)" }}>
                  {isProfileComplete ? "Delivery details saved" : "Fill delivery details before paying"}
                </p>
              </div>

              {showProfileForm ? (
                <div className="rounded-2xl p-5 space-y-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Full Name
                      </label>
                      <input
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Riya Sharma"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Email Address
                      </label>
                      <input
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        placeholder="riya@example.com"
                        className="input-field"
                        type="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Phone Number
                      </label>
                      <input
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="input-field"
                        type="tel"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        City
                      </label>
                      <input
                        value={profile.city}
                        onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Mumbai"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Delivery Address
                      </label>
                      <input
                        value={profile.address}
                        onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Flat 4B, MG Road, Mumbai"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Pincode
                      </label>
                      <input
                        value={profile.pincode}
                        onChange={(e) => setProfile((p) => ({ ...p, pincode: e.target.value }))}
                        placeholder="400001"
                        className="input-field"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-xs" style={{ color: isProfileComplete ? "#4ade80" : "rgba(245,230,211,0.5)" }}>
                        {isProfileComplete ? "Details saved for this device" : "Complete all fields to continue"}
                      </p>
                      {isProfileComplete && (
                        <button
                          type="button"
                          onClick={() => {
                            setHasToggledProfile(true);
                            setShowProfileForm(false);
                          }}
                          className="rounded-full px-4 py-1.5 text-xs font-bold transition"
                          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}
                        >
                          Continue to Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-5 space-y-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold" style={{ color: "#f5e6d3" }}>
                      {profile.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setHasToggledProfile(true);
                        setShowProfileForm(true);
                      }}
                      className="rounded-full px-4 py-1.5 text-xs font-bold transition"
                      style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}
                    >
                      Edit Details
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(245,230,211,0.6)" }}>{profile.email} • {profile.phone}</p>
                  <p className="text-xs" style={{ color: "rgba(245,230,211,0.6)" }}>
                    {profile.address}, {profile.city} - {profile.pincode}
                  </p>
                </div>
              )}

              {isProfileComplete && !showProfileForm && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-sm font-semibold" style={{ color: "rgba(245,230,211,0.5)" }}>
                    Choose a payment method
                  </p>
                </div>
              )}

              {isProfileComplete && !showProfileForm && (
                <>
                  <button
                    type="button"
                    onClick={() => setMethod("stripe")}
                    className="flex w-full items-center justify-between rounded-2xl p-5 text-left transition-all card-lift"
                    style={{
                      background: method === "stripe" ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                      border: method === "stripe" ? "1px solid rgba(251,191,36,0.45)" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div>
                      <p className="text-lg font-black" style={{ color: "#f5e6d3" }}>Stripe Card / UPI (Stripe)</p>
                      <p className="text-xs" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Instant confirmation. Redirects to Stripe checkout.
                      </p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: method === "stripe" ? "#fbbf24" : "rgba(245,230,211,0.45)" }}>
                      {method === "stripe" ? "Selected" : "Choose"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("upi")}
                    className="flex w-full items-center justify-between rounded-2xl p-5 text-left transition-all card-lift"
                    style={{
                      background: method === "upi" ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                      border: method === "upi" ? "1px solid rgba(251,191,36,0.45)" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div>
                      <p className="text-lg font-black" style={{ color: "#f5e6d3" }}>UPI App (Pay via UPI)</p>
                      <p className="text-xs" style={{ color: "rgba(245,230,211,0.5)" }}>
                        Enter UPI ID and we will open your UPI app.
                      </p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: method === "upi" ? "#fbbf24" : "rgba(245,230,211,0.45)" }}>
                      {method === "upi" ? "Selected" : "Choose"}
                    </span>
                  </button>

                  {method === "upi" && (
                    <div className="rounded-2xl p-5 space-y-2"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                        UPI ID for Payment
                      </label>
                      <input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="input-field"
                      />
                      <p className="text-xs" style={{ color: "rgba(245,230,211,0.45)" }}>
                        This will open your installed UPI app on mobile devices.
                      </p>
                    </div>
                  )}
                </>
              )}

              {success && (
                <div className="rounded-2xl p-4 text-sm font-semibold fade-up"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <p>{success}</p>
                </div>
              )}

              {error && (
                <div className="rounded-2xl p-4 text-sm font-semibold fade-up"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  {error}
                </div>
              )}
            </section>

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

                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="btn-amber w-full py-4 text-sm font-black shadow-xl shadow-orange-500/30 pulse-glow"
                >
                  {loading ? "Processing..." : `Pay Now - ${money(summary.total)}`}
                </button>

                <Link href="/cart"
                  className="block text-center text-xs font-semibold underline-offset-2 hover:underline"
                  style={{ color: "rgba(251,191,36,0.6)" }}>
                  Back to Cart
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
