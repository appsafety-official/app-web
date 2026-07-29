"use client";

import { useEffect } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalAmount } = useCartStore();

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
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  const waText = encodeURIComponent(
    `Halo APP Safety! Saya mau order:\n${items
      .map(
        (i) =>
          `- ${i.name} x${i.quantity} = Rp ${(i.price * i.quantity).toLocaleString("id-ID")}`
      )
      .join("\n")}\n\nTotal: Rp ${totalAmount().toLocaleString("id-ID")}`
  );

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-bold">
              CART ({items.length})
            </span>
          </div>
          <button onClick={onClose} className="transition-colors hover:text-gray-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-xs text-gray-400">
              <ShoppingCart className="mb-2 h-8 w-8" strokeWidth={1} />
              Your cart is empty
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 px-4 py-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-tight">{item.name}</p>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 transition-colors hover:bg-gray-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2.5ch] text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 transition-colors hover:bg-gray-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-300 transition-colors hover:text-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="mb-4 flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span className="font-mono">
                Rp {totalAmount().toLocaleString("id-ID")}
              </span>
            </div>
            <a
              href={`https://wa.me/6281234567890?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-sm bg-yellow px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              COMPLETE ORDER VIA WA &gt;&gt;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
