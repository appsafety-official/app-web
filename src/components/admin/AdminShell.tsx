"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FileText,
  HardHat,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/products", labelKey: "products", icon: Package },
  { href: "/admin/prospects", labelKey: "prospects", icon: Users },
  { href: "/admin/orders", labelKey: "orders", icon: ShoppingCart },
  { href: "/admin/blog", labelKey: "blog", icon: FileText },
] as const;

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r border-stone-900 bg-white md:w-64">
        <nav className="flex-1 space-y-1 p-2 pt-4 md:p-4">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={t(item.labelKey)}
                className={`flex items-center justify-center gap-3 rounded-none px-2 py-2.5 font-mono text-sm transition-colors md:justify-start md:px-3 ${
                  active
                    ? "bg-stone-900 font-bold text-yellow-500"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-stone-900 p-3 text-center md:px-4 md:text-left">
          <p className="hidden font-mono text-xs text-stone-500 md:block">
            APP SAFETY
          </p>
          <p className="font-mono text-xs text-stone-500 md:hidden">AS</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pl-16 md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-900 bg-white px-4 md:px-6">
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-yellow-500" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-stone-900">
              {t("appName")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-stone-600 sm:inline">
              {userEmail}
            </span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
