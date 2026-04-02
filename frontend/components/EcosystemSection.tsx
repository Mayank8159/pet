'use client';

import { TrendingUp, CreditCard, BarChart3 } from "lucide-react";

export function EcosystemSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        <h2 className="mx-auto max-w-5xl text-center text-[2rem] leading-[1.1] font-medium md:text-[3.2rem]">
          Our ecosystem - empowering SMEs through integrated solutions
        </h2>
        <p className="mx-auto mt-5 max-w-4xl text-center text-base text-[#32485e] md:text-xl">
          We combine deep industry expertise with creative problem-solving to craft
          products that drive efficiency and unlock new possibilities.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="min-h-[240px] rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(17,24,39,0.15)] hover:border-white/40 md:p-9">
            <div className="rounded-lg bg-[#cf1e38]/20 p-3 w-fit mb-4 backdrop-blur-sm">
              <CreditCard className="w-6 h-6 text-[#cf1e38]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#031a33] md:text-[1.9rem]">PAYROLL</h3>
            <p className="mt-4 max-w-2xl text-base text-[#344a60] md:text-lg">
              Complete solution for easy attendance tracking, simplified payroll
              management, and a leave monitoring system.
            </p>
          </article>

          <article className="min-h-[240px] rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(17,24,39,0.15)] hover:border-white/40 md:p-9">
            <div className="rounded-lg bg-[#cf1e38]/20 p-3 w-fit mb-4 backdrop-blur-sm">
              <BarChart3 className="w-6 h-6 text-[#cf1e38]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#031a33] md:text-[1.9rem]">INVOICE</h3>
            <p className="mt-4 max-w-2xl text-base text-[#344a60] md:text-lg">
              GST billing and inventory management solution for B2B and retail
              businesses, designed to provide real-time insights.
            </p>
          </article>

          <article className="min-h-[240px] rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(17,24,39,0.15)] hover:border-white/40 md:col-span-2 md:p-9">
            <div className="rounded-lg bg-[#cf1e38]/20 p-3 w-fit mb-4 backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-[#cf1e38]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#031a33] md:text-[1.9rem]">POS</h3>
            <p className="mt-4 max-w-3xl text-base text-[#344a60] md:text-lg">
              All-rounder solution designed to drive restaurant growth, supporting
              all types of food service outlets.
            </p>
            <a
              href="#"
              className="mt-4 inline-block text-base text-[#cf1e38] underline underline-offset-[6px] md:text-lg hover:text-[#9b1626] transition-colors"
            >
              Know More
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
