"use client";

import { useEffect } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { CheckoutForm } from "@/components/public/CheckoutForm";

export default function CartDrawer() {
  const t = useTranslations("common.cart");
  const tc = useTranslations("common.checkout");
  const { open, directItems, close, updateDirectItemQuantity, removeDirectItem } =
    useCheckoutStore();
  const { items, removeItem, updateQuantity, totalAmount } = useCartStore();

  const displayItems = directItems ?? items;
  const isDirect = directItems !== null;
  const total = directItems
    ? directItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    : totalAmount();

  const changeQuantity = (productId: string, quantity: number) => {
    if (isDirect) updateDirectItemQuantity(productId, quantity);
    else updateQuantity(productId, quantity);
  };

  const handleRemove = (productId: string) => {
    if (isDirect) removeDirectItem(productId);
    else removeItem(productId);
  };

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={close}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-bold">
              {isDirect ? tc("title") : t("title")} ({displayItems.length})
            </span>
          </div>
          <button onClick={close} className="transition-colors hover:text-gray-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-xs text-gray-400">
              <ShoppingCart className="mb-2 h-8 w-8" strokeWidth={1} />
              {t("empty")}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {displayItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 px-4 py-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-tight">{item.name}</p>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => changeQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 transition-colors hover:bg-gray-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2.5ch] text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => changeQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 transition-colors hover:bg-gray-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-gray-300 transition-colors hover:text-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {displayItems.length > 0 && (
          <div className="space-y-4 border-t border-gray-200 px-4 py-4">
            <div className="flex justify-between text-sm font-bold">
              <span>{t("total")}</span>
              <span className="font-mono">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
            <CheckoutForm items={directItems ?? undefined} onSuccess={close} />
          </div>
        )}
      </div>
    </div>
  );
}