"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function EnterPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.error ?? "Incorrect password. Please try again.");
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(12,82,82,0.08)", color: "#0c5252" }}
        >
          <Lock size={22} />
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-3xl font-light italic tracking-tight m-0"
            style={{ fontFamily: "var(--font-serif)", color: "#0c5252" }}
          >
            Kanmani Clinic
          </h1>
          <p className="text-sm m-0" style={{ color: "#3f4848" }}>
            Enter the access password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              backgroundColor: "#ffffff",
              border: error ? "1.5px solid #d9534f" : "1.5px solid rgba(191,200,200,0.5)",

              color: "#1b1c1a",
              boxShadow: "0px 4px 12px rgba(27,28,26,0.04)",
            }}
          />
          {error && (
            <p className="text-xs m-0" style={{ color: "#d9534f" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer border-none"
            style={{
              background: "linear-gradient(135deg, #0c5252, #2d6a6a)",
              boxShadow: "0 4px 14px rgba(12,82,82,0.25)",
            }}
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
