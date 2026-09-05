"use client";

import { useTranslations } from "next-intl";
import { DEFAULT_WA_MESSAGE, buildWaUrl } from "@/lib/whatsapp";

export default function StickyWhatsAppButton() {
  const t = useTranslations("common.stickyWa");

  return (
    <a
      href={buildWaUrl(DEFAULT_WA_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("ariaLabel")}
      className="group wa-sticky-pop fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-4 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      <span
        aria-hidden="true"
        className="wa-sticky-ring pointer-events-none absolute inset-0 rounded-full bg-[#25D366]"
      />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap font-mono text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 group-hover:max-w-[12rem] group-hover:pr-1 sm:block">
        {t("label")}
      </span>
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-6 w-6 shrink-0 text-white"
        aria-hidden="true"
      >
        <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.72 6.41L3.2 28.8l6.56-1.72a12.76 12.76 0 0 0 6.24 1.6h.01c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8Zm0 23.36h-.01a10.63 10.63 0 0 1-5.42-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.58 10.58 0 0 1-1.62-5.64c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.11 7.52c0 5.86-4.77 10.61-10.63 10.61Zm5.83-7.95c-.32-.16-1.98-.98-2.29-1.09-.31-.11-.53-.17-.75.16-.22.32-.87 1.09-1.07 1.31-.2.22-.39.25-.71.08-.32-.16-1.36-.5-2.58-1.6-.95-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.82-.98-2.48-.25-.65-.51-.56-.71-.57h-.64c-.22 0-.58.08-.88.4-.3.32-1.15 1.13-1.15 2.75s1.18 3.19 1.34 3.41c.16.22 2.32 3.54 5.62 4.97.79.34 1.4.54 1.88.69.79.25 1.51.22 2.08.13.63-.09 2.15-.88 2.45-1.73.3-.85.3-1.58.21-1.73-.08-.15-.29-.24-.61-.4Z" />
      </svg>
    </a>
  );
}
