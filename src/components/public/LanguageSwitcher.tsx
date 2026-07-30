"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ChevronDown, Check } from "lucide-react";

const locales = [
  { code: "en", label: "English" },
  { code: "id", label: "Bahasa Indonesia" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const active = locales.find((l) => l.code === locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-none border border-stone-900 bg-stone-50 px-3 py-1.5 font-mono text-sm uppercase text-stone-900 transition-colors hover:bg-stone-100"
      >
        {active?.code}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-none bg-stone-900 border border-stone-900 shadow-lg z-50">
          {locales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => {
                if (locale !== loc.code) {
                  router.replace(pathname, { locale: loc.code });
                }
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 font-mono text-sm transition-colors ${
                locale === loc.code
                  ? 'bg-stone-800 text-yellow-500'
                  : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
              }`}
            >
              <span>{loc.label}</span>
              {locale === loc.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
