"use client";

import { useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuoteStore } from "@/store/useQuoteStore";
import { QuoteRequestForm } from "@/components/public/QuoteRequestForm";


export default function QuoteDrawer() {
  const t = useTranslations("common.quote");
  const { open, product, quantity, setQuantity, close } = useQuoteStore();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={close}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{t("title")}</span>
          </div>
          <button onClick={close} className="transition-colors hover:text-gray-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-3 border border-gray-200 p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-stone-900 bg-stone-100">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <span className="font-mono text-[10px] text-stone-400">[IMG]</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">{product.name}</p>
              <div className="mt-2 inline-flex items-center border border-gray-200">
                <button
                  onClick={() => setQuantity(quantity - 1)}
                  className="px-2 py-1 transition-colors hover:bg-gray-50"
                  aria-label="-"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[2.5ch] text-center text-xs font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-1 transition-colors hover:bg-gray-50"
                  aria-label="+"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 font-mono text-[11px] leading-relaxed text-stone-500">
            {t("quoteHint")}
          </p>

          <div className="mt-4">
            <QuoteRequestForm product={product} quantity={quantity} onSuccess={close} />
          </div>
        </div>
      </div>
    </div>
  );
}
