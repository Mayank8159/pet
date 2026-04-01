'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  navItems?: string[];
}

export function Navbar({ navItems = ['Products', 'About Us', 'Careers'] }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#001a31]/90 via-[#032448]/90 to-[#02213f]/90 backdrop-blur-xl border-b border-white/20 shadow-2xl">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="/tablogo.png"
              alt="Tabio"
              width={140}
              height={45}
              className="h-9 md:h-11 w-auto"
              priority
            />
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-semibold text-white relative group transition-colors duration-200 hover:text-[#ff6b9d]"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ff6b9d] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex flex-shrink-0 ml-auto">
            <button className="px-7 py-2.5 bg-[#cf1e38] text-white font-semibold text-sm rounded-lg hover:bg-[#ff6b9d] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-gradient-to-b from-[#032448]/95 to-[#001a31]/95 backdrop-blur-xl py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2 px-2">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:bg-white/10 hover:text-[#ff6b9d] transition-all duration-200"
                >
                  {item}
                </a>
              ))}
              <button className="w-full px-4 py-2.5 mt-3 bg-[#cf1e38] text-white font-semibold text-sm rounded-lg hover:bg-[#ff6b9d] active:scale-95 transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
