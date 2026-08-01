"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const t = useTranslations("admin.nav");

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/admin/login" })}
      className="flex items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500 hover:text-stone-900"
    >
      <LogOut className="h-4 w-4" />
      {t("logout")}
    </button>
  );
}
