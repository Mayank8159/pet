import Link from "next/link";
import { ArrowLeft, Bell, Palette, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe7d6,#fff6ee_40%,#fffaf5)] p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/bill"
          className="inline-flex items-center gap-2 rounded-xl border border-[#ffd8c6] bg-white px-4 py-2 text-sm text-[#8a2d22]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Billing
        </Link>

        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-[#cc4b3e]">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold">POS Preferences & Controls</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#ffd8c6] bg-white/90 p-4 shadow-[0_10px_30px_rgba(204,75,62,0.08)]">
            <Palette className="h-5 w-5 text-[#cc4b3e]" />
            <p className="mt-3 text-sm text-slate-600">Theme Profile</p>
            <p className="mt-1 text-2xl font-semibold">Service Light</p>
          </article>
          <article className="rounded-2xl border border-[#ffd8c6] bg-white/90 p-4 shadow-[0_10px_30px_rgba(245,158,11,0.08)]">
            <Bell className="h-5 w-5 text-[#d97706]" />
            <p className="mt-3 text-sm text-slate-600">Alert Routing</p>
            <p className="mt-1 text-2xl font-semibold">Enabled</p>
          </article>
          <article className="rounded-2xl border border-[#ffd8c6] bg-white/90 p-4 shadow-[0_10px_30px_rgba(47,158,136,0.08)]">
            <ShieldCheck className="h-5 w-5 text-[#2f9e88]" />
            <p className="mt-3 text-sm text-slate-600">Role Guard</p>
            <p className="mt-1 text-2xl font-semibold">Active</p>
          </article>
        </section>
      </div>
    </main>
  );
}
