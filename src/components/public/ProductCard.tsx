"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string | null;
  viewDetail?: boolean;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  imageUrl,
  viewDetail = false,
}: ProductCardProps) {
  const t = useTranslations("common.productCard");
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex flex-col rounded-none border border-stone-900 bg-white">
      <Link href={`/products/${id}`} className="group">
        <div className="relative aspect-square w-full overflow-hidden border-b border-stone-900 bg-stone-100">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="font-mono text-xs tracking-widest text-stone-400">
              [{t("productPlaceholder")}]
            </span>
          )}
          <span className="absolute left-2 top-2 border border-stone-900 bg-white/90 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-stone-600">
            {category}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 py-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-sm font-bold leading-tight text-black">
            {name}
          </h3>
        </Link>
        <p className="mt-1 font-mono text-base font-bold text-black">
          Rp {price.toLocaleString("id-ID")}
        </p>
      </div>

      {viewDetail ? (
        <Link
          href={`/products/${id}`}
          className="mt-auto block w-full rounded-sm bg-yellow px-4 py-3 text-center text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          {t("viewDetail")}
        </Link>
      ) : (
        <button
          onClick={() => addItem({ productId: id, name, price })}
          className="mt-auto w-full rounded-sm bg-yellow px-4 py-3 text-center text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          {t("addToCart")}
        </button>
      )}
    </div>
  );
}
