"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/useCartStore";

export type PublicProductDetail = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  specs: { material: string; size: string; certification: string };
};

export default function ProductDetailView({
  product,
}: {
  product: PublicProductDetail | null;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const t = useTranslations("common.productDetail");

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-sm text-stone-500">{t("notFound")}</p>
        <Link
          href="/products"
          className="mt-4 inline-block border border-stone-900 px-6 py-3 text-sm font-bold transition-colors hover:bg-stone-100"
        >
          {t("backToCatalog")}
        </Link>
      </div>
    );
  }

  const specKeys = ["material", "size", "certification"] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/products"
        className="mb-8 flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToCatalog")}
      </Link>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="aspect-square flex items-center justify-center overflow-hidden border border-stone-900 bg-stone-100">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="text-4xl tracking-widest text-stone-400">
              [{t("imagePlaceholder")}]
            </span>
          )}
        </div>

        <div>
          <span className="inline-block border border-stone-900 px-3 py-1 text-[10px] font-bold tracking-widest text-stone-600">
            {product.category}
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-stone-900">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          {product.description && (
            <p className="mt-4 text-xs leading-relaxed text-stone-600">
              {product.description}
            </p>
          )}

          <div className="mt-6 border border-stone-900">
            {specKeys.map((key) => (
              <div
                key={key}
                className="flex border-b border-stone-900 last:border-b-0"
              >
                <span className="w-28 border-r border-stone-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {t(key)}
                </span>
                <span className="flex-1 px-3 py-2 text-xs">
                  {product.specs[key] || "-"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-stone-900">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 transition-colors hover:bg-stone-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3ch] text-center text-sm font-bold">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2 transition-colors hover:bg-stone-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              for (let i = 0; i < qty; i++) {
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                });
              }
            }}
            className="mt-4 w-full rounded-sm bg-yellow px-4 py-3 text-center text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            {t("addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
