"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";

export default function AuthModal() {
  const { showAuth, closeAuth, saveAuth } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [channel, setChannel] = useState("");

  if (!showAuth) return null;

  const isEmail = identifier.includes("@");
  const payload = isEmail ? { email: identifier } : { phone: identifier };

  const requestOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      const channelValue =
        typeof data.channel === "string" ? data.channel : data.channel?.channel || "";
      setChannel(channelValue);
      setStep("verify");
    } catch (err) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify");
      saveAuth({ token: data.token, user: data.user });
      setIdentifier("");
      setCode("");
      setStep("request");
      closeAuth();
    } catch (err) {
      setError(err.message || "Failed to verify");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setError("");
    setCode("");
    setStep("request");
    closeAuth();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-3xl p-6" style={{ background: "#0f0b08", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(251,191,36,0.7)" }}>
              Sign In
            </p>
            <h3 className="text-2xl font-black" style={{ color: "#f5e6d3" }}>
              Access your orders
            </h3>
          </div>
          <button onClick={onClose} className="text-xs font-bold" style={{ color: "rgba(245,230,211,0.5)" }}>
            CLOSE
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {step === "request" ? (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                  Email or Phone
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@email.com or +91 98765 43210"
                  className="input-field"
                />
              </div>
              <button
                onClick={requestOtp}
                disabled={loading || identifier.trim().length < 6}
                className="btn-amber w-full py-3 text-sm font-black"
              >
                {loading ? "Sending..." : "Send one-time code"}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs" style={{ color: "rgba(245,230,211,0.5)" }}>
                Code sent via {channel}. Enter it below.
              </p>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(245,230,211,0.5)" }}>
                  One-time Code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={verifyOtp}
                  disabled={loading || code.trim().length < 4}
                  className="btn-amber flex-1 py-3 text-sm font-black"
                >
                  {loading ? "Verifying..." : "Verify & sign in"}
                </button>
                <button
                  onClick={() => setStep("request")}
                  className="text-xs font-semibold underline-offset-2 hover:underline"
                  style={{ color: "rgba(251,191,36,0.7)" }}
                >
                  Resend
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl p-3 text-xs font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
