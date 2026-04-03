"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Lock, Mail, User } from "lucide-react";
import { FormEvent, useState } from "react";
import axios from "axios";
import { setAuthSession } from "@/lib/auth";

const POS_API_BASE_URL = process.env.NEXT_PUBLIC_POS_API_BASE_URL ?? "http://localhost:8000";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(`${POS_API_BASE_URL}/api/pos/auth/signup`, {
        name,
        businessName,
        email,
        password,
      });

      const token = String(response.data?.token || "");
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error("Invalid signup response");
      }

      setAuthSession(token, user);
      router.push("/");
      router.refresh();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#001a31] via-[#032448] to-[#02213f] px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center text-white md:mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9ec0de]">Tabio Onboarding</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">Create Your Account</h1>
          <p className="mt-3 text-sm text-[#a9bfd4] md:text-base">
            Start your POS and operations journey in minutes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/15 bg-white/8 p-6 text-white shadow-[0_20px_50px_rgba(0,12,28,0.35)] backdrop-blur-xl md:p-8">
            <h2 className="text-xl font-semibold md:text-2xl">Sign Up</h2>
            <p className="mt-2 text-sm text-[#c0d4e6]">Create credentials for your business workspace.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm text-[#d7e5f3]">
                  <User className="h-4 w-4" />
                  Full Name
                </span>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#082744] px-4 py-3 text-white placeholder:text-[#98b4cb] outline-none transition focus:border-[#6ca3d6]"
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm text-[#d7e5f3]">
                  <Building2 className="h-4 w-4" />
                  Business Name
                </span>
                <input
                  type="text"
                  placeholder="Your restaurant or store"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#082744] px-4 py-3 text-white placeholder:text-[#98b4cb] outline-none transition focus:border-[#6ca3d6]"
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm text-[#d7e5f3]">
                  <Mail className="h-4 w-4" />
                  Email
                </span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#082744] px-4 py-3 text-white placeholder:text-[#98b4cb] outline-none transition focus:border-[#6ca3d6]"
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm text-[#d7e5f3]">
                  <Lock className="h-4 w-4" />
                  Password
                </span>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#082744] px-4 py-3 text-white placeholder:text-[#98b4cb] outline-none transition focus:border-[#6ca3d6]"
                />
              </label>

              {error ? (
                <p className="text-sm font-medium text-rose-300">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#cf1e38] px-4 py-3 font-semibold text-white shadow-[0_14px_26px_rgba(207,30,56,0.32)] transition hover:brightness-110"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-5 text-sm text-[#c6d8ea]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                Login
              </Link>
            </p>
          </section>

          <section className="rounded-3xl border border-white/15 bg-[#f4f5f7] p-6 text-[#1f2027] shadow-[0_20px_50px_rgba(0,12,28,0.22)] md:p-8">
            <h3 className="text-xl font-semibold">What you get instantly</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#465567]">
              <li>Modern billing desk with section and table controls.</li>
              <li>Live kitchen view and completed order history.</li>
              <li>Role-friendly workflows for operations teams.</li>
              <li>Scalable foundation for reports and automation.</li>
            </ul>
            <Link
              href="/"
              className="mt-6 inline-flex items-center text-sm font-semibold text-[#032448] underline decoration-[#032448]/40 underline-offset-4"
            >
              Back to home
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
