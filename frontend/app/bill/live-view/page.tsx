"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock3, MoonStar, Radar, SunMedium, Users } from "lucide-react";

export default function LiveViewPage() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const isThemeReadyRef = useRef(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pos-theme");
    window.setTimeout(() => {
      isThemeReadyRef.current = true;
      if (savedTheme === "dark") {
        setTheme("dark");
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!isThemeReadyRef.current) {
      return;
    }
    window.localStorage.setItem("pos-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen p-6 ${
        isDark
          ? "bg-[radial-gradient(circle_at_top_left,#1e0d0b,#0b0f1a_45%,#080b14)] text-slate-100"
          : "bg-[radial-gradient(circle_at_top_left,#ffe7d6,#fff6ee_40%,#fffaf5)] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/bill"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
              isDark ? "border-white/15 bg-white/5 text-slate-100" : "border-[#ffd8c6] bg-white text-[#8a2d22]"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </Link>
          <button
            type="button"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
              isDark ? "border-white/15 bg-white/5 text-slate-100" : "border-[#ffd8c6] bg-white text-[#8a2d22]"
            }`}
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            {isDark ? "Light" : "Dark"}
          </button>
        </div>

        <header>
          <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? "text-[#ffb09a]" : "text-[#cc4b3e]"}`}>Live View</p>
          <h1 className="mt-2 text-3xl font-semibold">Real-Time Floor Overview</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article
            className={`rounded-2xl border p-4 ${
              isDark
                ? "border-white/10 bg-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                : "border-[#ffd8c6] bg-white/90 shadow-[0_10px_30px_rgba(204,75,62,0.08)]"
            }`}
          >
            <Radar className="h-5 w-5 text-[#cc4b3e]" />
            <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Active Tables</p>
            <p className="mt-1 text-2xl font-semibold">18</p>
          </article>
          <article
            className={`rounded-2xl border p-4 ${
              isDark
                ? "border-white/10 bg-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                : "border-[#ffd8c6] bg-white/90 shadow-[0_10px_30px_rgba(245,158,11,0.08)]"
            }`}
          >
            <Clock3 className="h-5 w-5 text-[#d97706]" />
            <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Avg Wait Time</p>
            <p className="mt-1 text-2xl font-semibold">09m</p>
          </article>
          <article
            className={`rounded-2xl border p-4 ${
              isDark
                ? "border-white/10 bg-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                : "border-[#ffd8c6] bg-white/90 shadow-[0_10px_30px_rgba(47,158,136,0.08)]"
            }`}
          >
            <Users className="h-5 w-5 text-[#2f9e88]" />
            <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Guests In-House</p>
            <p className="mt-1 text-2xl font-semibold">64</p>
          </article>
        </section>
      </div>
    </main>
  );
}
