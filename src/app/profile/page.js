"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "", city: "", pincode: "", notes: "" };

const FIELDS = [
  { name: "name",    label: "Full Name",         type: "text",  placeholder: "Riya Sharma",           col: 1 },
  { name: "email",   label: "Email Address",     type: "email", placeholder: "riya@example.com",       col: 1 },
  { name: "phone",   label: "Phone Number",      type: "tel",   placeholder: "+91 98765 43210",        col: 1 },
  { name: "city",    label: "City",              type: "text",  placeholder: "Mumbai",                col: 1 },
  { name: "pincode", label: "Pincode",           type: "text",  placeholder: "400001",                col: 1 },
  { name: "address", label: "Delivery Address",  type: "text",  placeholder: "Flat 4B, MG Road, Mumbai", col: 1 },
];

export default function ProfilePage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { token, openAuth, user } = useAuth();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          const loaded = data.profile || {};
          setForm((prev) => ({
            ...prev,
            ...loaded,
            email: loaded.email || user?.email || prev.email,
            phone: loaded.phone || user?.phone || prev.phone,
          }));
        } else if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            email: user?.email || prev.email,
            phone: user?.phone || prev.phone,
          }));
        }
      } catch {}
      if (!cancelled) setLoadingProfile(false);
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [token, user?.email, user?.phone]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return;
      setLoadingOrders(true);
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.orders)) {
          const mapped = data.orders.map((order) => {
            const statusRaw = order.status || "pending";
            const statusLabel = statusRaw === "paid"
              ? "Paid"
              : statusRaw === "cod_pending"
                ? "Cash On Delivery"
                : statusRaw.replace(/_/g, " ");
            const statusTone = statusRaw === "paid" ? "paid" : statusRaw === "cod_pending" ? "cod" : "pending";
            return {
              id: `#${order._id}`,
              date: new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              status: statusLabel,
              statusTone,
              total: `Rs ${Math.round(order.totals?.total || 0)}`,
              items: order.items?.map((item) => item.name).join(", ") || "",
            };
          });
          setOrders(mapped);
        }
      } catch {
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      openAuth();
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-bg min-h-screen">
      <div className="mx-auto max-w-5xl space-y-10 px-4 pb-20 pt-10 sm:px-6">

        {/* Header */}
        <div className="fade-up">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,191,36,0.7)" }}>
            Account
          </p>
          <h1 className="text-4xl font-black" style={{ color: "#f5e6d3" }}>My Profile</h1>
          {loadingProfile && (
            <p className="mt-2 text-xs" style={{ color: "rgba(245,230,211,0.5)" }}>
              Loading saved details...
            </p>
          )}
        </div>

        {/* Profile card */}
        <section className="rounded-3xl p-6 md:p-8 fade-up"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Avatar row */}
          <div className="mb-8 flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-black"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#0a0705" }}>
              {form.name ? form.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: "#f5e6d3" }}>
                {form.name || "Your Name"}
              </p>
              <p className="text-sm" style={{ color: "rgba(245,230,211,0.5)" }}>
                {form.email || "Update your profile below"}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map(({ name, label, type, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(245,230,211,0.5)" }}>
                    {label}
                  </label>
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: "rgba(245,230,211,0.5)" }}>
                Delivery Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={3}
                placeholder="Ring the bell twice, leave at door, etc."
                className="input-field resize-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button type="submit"
                disabled={saving}
                className="btn-amber px-8 py-3 text-sm font-black shadow-lg shadow-orange-500/25">
                {saving ? "Saving..." : "Save Profile"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#4ade80" }}>
                  <span>OK</span> Saved successfully!
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Orders section */}
        <section className="space-y-5 fade-up-d1">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,191,36,0.7)" }}>
                History
              </p>
              <h2 className="text-2xl font-black" style={{ color: "#f5e6d3" }}>Recent Orders</h2>
            </div>
            {!token && (
              <button onClick={openAuth} className="btn-amber px-4 py-2 text-xs font-black">
                Sign in to view
              </button>
            )}
          </div>

          {loadingOrders ? (
            <div className="rounded-2xl p-6 text-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              Loading orders...
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => (
                <div key={order.id}
                  className="flex flex-col gap-3 rounded-2xl p-5 card-lift sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    animationDelay: `${i * 80}ms`,
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black"
                      style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.15)" }}>
                      MEAL
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#f5e6d3" }}>{order.id}</p>
                      <p className="text-xs" style={{ color: "rgba(245,230,211,0.45)" }}>{order.items}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span style={{ color: "rgba(245,230,211,0.5)" }}>{order.date}</span>
                    <span className="font-black gradient-text">{order.total}</span>
                    <span className="rounded-full px-3 py-1 text-xs font-bold"
                      style={order.statusTone === "paid"
                        ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }
                        : order.statusTone === "cod"
                          ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }
                          : { background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" }}>
                      {order.status}
                    </span>
                    <button className="text-xs font-semibold underline-offset-2 hover:underline"
                      style={{ color: "rgba(251,191,36,0.7)" }}>
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Preferences / Quick info */}
        <section className="grid gap-4 sm:grid-cols-3 fade-up-d2">
          {[
            { icon: "GIFT", label: "Loyalty Points", value: "1,240 pts", sub: "Next reward at 1,500" },
            { icon: "BOX", label: "Total Orders", value: "14 Orders", sub: "Joined Jan 2026" },
            { icon: "STAR", label: "Avg Rating Given", value: "4.7 / 5", sub: "Keep reviewing!" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl p-5 card-lift"
              style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
              <p className="text-2xl mb-2">{card.icon}</p>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(251,191,36,0.6)" }}>{card.label}</p>
              <p className="mt-1 text-xl font-black" style={{ color: "#f5e6d3" }}>{card.value}</p>
              <p className="mt-0.5 text-xs" style={{ color: "rgba(245,230,211,0.4)" }}>{card.sub}</p>
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}

