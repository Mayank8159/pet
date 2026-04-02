'use client';

import { Mail, Phone, MapPin } from "lucide-react";

const options = [
  "POSS - For Food & Beverage Industry",
  "Invoice - For B2B and Retail Businesses",
  "Payroll - All-in-one Payroll Solutions",
  "Purchase - AI Inventory System",
  "Tasks - Task Management Software",
];

export function ContactSection() {
  return (
    <section className="bg-[#031a33] py-16 md:py-24">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-[2rem] leading-[1.08] font-semibold text-white md:text-[3.6rem]">
              Get in Touch
            </h2>
            <p className="mt-6 text-base text-[#a9bfd4] md:text-lg">
              Have questions about Tabio? Our team is here to help you find the perfect solution for your business.
            </p>
            
            <div className="mt-12 space-y-8">
              <div className="flex gap-4">
                <div className="rounded-lg bg-[#cf1e38]/20 p-3 flex-shrink-0 backdrop-blur-sm">
                  <Mail className="w-6 h-6 text-[#cf1e38]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Email</h3>
                  <p className="text-[#a9bfd4] mt-1">mukherjeesujit602@gmail.com</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="rounded-lg bg-[#cf1e38]/20 p-3 flex-shrink-0 backdrop-blur-sm">
                  <Phone className="w-6 h-6 text-[#cf1e38]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Phone</h3>
                  <p className="text-[#a9bfd4] mt-1">+91 70292 14041</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="rounded-lg bg-[#cf1e38]/20 p-3 flex-shrink-0 backdrop-blur-sm">
                  <MapPin className="w-6 h-6 text-[#cf1e38]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Location</h3>
                  <p className="text-[#a9bfd4] mt-1">Newtown, Kolkata - 700135</p>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-white">
                Name*
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-2 h-12 w-full rounded-lg border border-white/30 bg-white/10 px-4 text-white placeholder-white/50 outline-none transition focus:border-[#cf1e38] focus:ring-2 focus:ring-[#cf1e38]/30 backdrop-blur-sm"
                />
              </label>
              <label className="text-sm font-semibold text-white">
                Email*
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  className="mt-2 h-12 w-full rounded-lg border border-white/30 bg-white/10 px-4 text-white placeholder-white/50 outline-none transition focus:border-[#cf1e38] focus:ring-2 focus:ring-[#cf1e38]/30 backdrop-blur-sm"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-white">
                Phone*
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-2 h-12 w-full rounded-lg border border-white/30 bg-white/10 px-4 text-white placeholder-white/50 outline-none transition focus:border-[#cf1e38] focus:ring-2 focus:ring-[#cf1e38]/30 backdrop-blur-sm"
                />
              </label>
              <label className="text-sm font-semibold text-white">
                Company*
                <input
                  type="text"
                  placeholder="Your business name"
                  className="mt-2 h-12 w-full rounded-lg border border-white/30 bg-white/10 px-4 text-white placeholder-white/50 outline-none transition focus:border-[#cf1e38] focus:ring-2 focus:ring-[#cf1e38]/30 backdrop-blur-sm"
                />
              </label>
            </div>

            <fieldset className="border-0 p-0">
              <legend className="text-sm font-semibold text-white mb-3">
                Interested In*
              </legend>
              <div className="space-y-2.5">
                {options.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="radio" 
                        name="interest" 
                        className="appearance-none w-5 h-5 border-2 border-white/30 rounded-full cursor-pointer checked:border-[#cf1e38] checked:bg-[#cf1e38] transition"
                      />
                    </div>
                    <span className="text-sm text-[#a9bfd4] group-hover:text-white transition">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              className="w-full h-12 rounded-lg bg-[#cf1e38] text-white font-semibold text-base shadow-lg hover:shadow-[0_12px_32px_rgba(207,30,56,0.4)] transition hover:bg-[#df2a48] active:scale-95 mt-6"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
