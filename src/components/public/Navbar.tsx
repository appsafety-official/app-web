"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("common.navbar");
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/products", label: t("products") },
    { href: "/blog", label: t("blog") },
    { href: "/contact", label: t("contact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? false : pathname.includes(href);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo-app.png" alt="APP SAFETY" className="h-8 w-auto" />
            <span className="font-mono text-lg font-bold tracking-wide text-black">APP SAFETY</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/" || isActive(link.href)
                    ? "text-black"
                    : "text-gray-400 transition-colors hover:text-black"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden items-center gap-2 rounded-sm border border-gray-900 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-50 sm:flex"
            >
              <User className="h-4 w-4" />
              {t("signIn")}
            </Link>
            <LanguageSwitcher />
            <button
              onClick={() => setCartOpen(true)}
              className="rounded-sm border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
            >
              <ShoppingCart className="h-4 w-4 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-black text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-sm border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50 sm:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4 text-gray-600" />
              ) : (
                <Menu className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 sm:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-sm border border-gray-900 px-3 py-2.5 text-sm font-semibold text-black"
              >
                <User className="h-4 w-4" />
                {t("signIn")}
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    link.href === "/" || isActive(link.href)
                      ? "text-base font-medium text-black"
                      : "text-base font-medium text-gray-500 transition-colors hover:text-black"
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
