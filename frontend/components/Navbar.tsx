'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { clearAuthSession, getAuthUser, type AuthUser } from '@/lib/auth';

interface NavbarProps {
  navItems?: string[];
}

export function Navbar({ navItems = ['Products', 'About Us', 'Careers'] }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function syncAuth() {
      setUser(getAuthUser());
    }

    syncAuth();
    window.addEventListener('tabio-auth-changed', syncAuth);
    return () => window.removeEventListener('tabio-auth-changed', syncAuth);
  }, []);

  function handleLogout() {
    clearAuthSession();
    setMobileMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#001a31] via-[#012a4a] to-[#001f39] border-b border-[#0b3b67] shadow-[0_10px_30px_rgba(0,12,28,0.35)]">
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
            <Link
              href="/bill"
              className="text-sm font-semibold text-white relative group transition-colors duration-200 hover:text-[#ff6b9d]"
            >
              Bill
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#ff6b9d] transition-all duration-300 group-hover:w-full" />
            </Link>
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-semibold text-white relative group transition-colors duration-200 hover:text-[#ff6b9d]"
              >
                {item}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#ff6b9d] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex flex-shrink-0 ml-auto">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white font-semibold border border-white/20">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-[#cf1e38] text-white font-semibold text-sm rounded-lg hover:bg-[#ff6b9d] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-7 py-2.5 bg-[#cf1e38] text-white font-semibold text-sm rounded-lg hover:bg-[#ff6b9d] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 bg-[#05325a] hover:bg-[#0a3e6e] transition-all duration-200"
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
          <div className="md:hidden border-t border-[#0b3b67] bg-gradient-to-b from-[#02284a] to-[#001a31] py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2 px-2">
              <Link
                href="/bill"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:bg-[#0b3b67] hover:text-[#ff6b9d] transition-all duration-200"
              >
                Bill
              </Link>
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:bg-[#0b3b67] hover:text-[#ff6b9d] transition-all duration-200"
                >
                  {item}
                </a>
              ))}
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-[#0b3b67] px-3 py-2 text-white">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white font-semibold border border-white/20">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 mt-3 bg-[#cf1e38] text-white font-semibold text-sm rounded-lg hover:bg-[#ff6b9d] active:scale-95 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full px-4 py-2.5 mt-3 bg-[#cf1e38] text-white font-semibold text-sm rounded-lg hover:bg-[#ff6b9d] active:scale-95 transition-all duration-200 text-center"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
