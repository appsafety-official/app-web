"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-black text-xs font-bold text-white">
              APP
            </span>
            <span className="text-sm font-bold text-black">APP SAFETY</span>
          </Link>

          {/* Center links */}
          <div className="hidden items-center gap-8 text-sm font-medium sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/"
                    ? "text-black"
                    : "text-gray-400 transition-colors hover:text-black"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="rounded-sm bg-yellow px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Get a Quote
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="rounded-sm border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
            >
              <ShoppingCart className="h-4 w-4 text-gray-600" />
              {mounted && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-black text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
