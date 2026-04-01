import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="rounded-b-[42px] bg-gradient-to-r from-[#001a31] via-[#032448] to-[#02213f] pt-20 md:pt-28">
      <div className="mx-auto w-[92%] max-w-[1510px] text-center text-white">
        <h1 className="mx-auto max-w-5xl text-[2.1rem] leading-[1.08] font-medium tracking-[-0.02em] md:text-[3.7rem]">
          All-in-One Software Powering SME Growth At Every Step
        </h1>
        <p className="mx-auto mt-6 max-w-4xl text-base text-[#a9bfd4] md:text-xl">
          Stay ahead of the curve with solutions that are designed for tomorrow&apos;s
          challenges, flexible tools that adapt to your unique needs.
        </p>
        <a
          href="#"
          className="mt-8 inline-flex h-14 w-[220px] items-center justify-center gap-2 rounded-2xl bg-[#cf1e38] text-base font-semibold text-white shadow-[0_12px_26px_rgba(207,30,56,0.24)] transition hover:-translate-y-1 hover:brightness-110 md:h-16 md:w-[280px] md:text-lg group"
        >
          <Sparkles className="w-5 h-5 group-hover:animate-spin" />
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="relative mx-auto mt-10 mb-[-4rem] h-[220px] w-[90%] max-w-[1200px] md:mt-16 md:mb-[-6rem] md:h-[360px]">
        <Image
          src="/laptopphone.png"
          alt="Tabio platform preview on laptop and phone"
          fill
          className="object-contain"
          priority
        />
      </div>
    </section>
  );
}
