"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuoteStore } from "@/store/useQuoteStore";
import type { SpecPair } from "@/repositories/interfaces/IProductRepository";

export type PublicProductDetail = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  imageUrl: string | null;
  imageGallery: string[];
  descriptionHtml: string;
  specs: SpecPair[];
};

export default function ProductDetailView({
  product,
}: {
  product: PublicProductDetail | null;
}) {
  const openQuote = useQuoteStore((s) => s.openQuote);
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

  const productImages = product.imageUrl
    ? [product.imageUrl, ...product.imageGallery]
    : product.imageGallery;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/products"
        className="mb-8 flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToCatalog")}
      </Link>

      <div className="grid gap-8 sm:grid-cols-2">
        <ProductGallery images={productImages} productName={product.name} />

        <div>
          <span className="inline-block border border-stone-900 px-3 py-1 text-[10px] font-bold tracking-widest text-stone-600">
            {product.category}
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-600">
            {t("priceOnRequest")}
          </p>
          {product.descriptionHtml && (
            <div
              className="prose prose-stone max-w-none prose-sm mt-4 prose-headings:font-mono prose-headings:text-stone-900 prose-headings:font-bold prose-p:text-stone-600 prose-p:leading-relaxed prose-a:font-semibold prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-4 prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          <div className="mt-6 border border-stone-900">
            {product.specs.length > 0 ? (
              product.specs.map((spec, index) => (
                <div
                  key={`${spec.key}-${index}`}
                  className="flex border-b border-stone-900 last:border-b-0"
                >
                  <span className="w-28 shrink-0 border-r border-stone-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {spec.key}
                  </span>
                  <span className="flex-1 px-3 py-2 text-xs">
                    {spec.value || "-"}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-stone-500">
                {t("noSpecs")}
              </div>
            )}
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
            onClick={() =>
              openQuote(
                {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                },
                qty,
              )
            }
            className="mt-4 w-full rounded-sm bg-yellow px-4 py-3 text-center text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            {t("requestQuote")}
          </button>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-12 flex items-center justify-end gap-2 text-xs font-medium text-stone-600 transition-colors hover:text-stone-900"
      >
        {t("viewAllProducts")} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useTranslations("common.productDetail");
  const safeIndex = activeIndex < images.length ? activeIndex : 0;

  if (images.length === 0) {
    return (
      <div className="aspect-square flex items-center justify-center overflow-hidden border border-stone-900 bg-stone-100">
        <span className="text-4xl tracking-widest text-stone-400">
          [{t("imagePlaceholder")}]
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square flex items-center justify-center overflow-hidden border border-stone-900 bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[safeIndex]}
          alt={`${productName} - ${safeIndex + 1}`}
          className="h-full w-full object-cover object-center"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden border bg-stone-100 transition-colors ${
                index === safeIndex
                  ? "border-stone-900"
                  : "border-stone-300 hover:border-stone-600"
              }`}
              aria-label={`${productName} - ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
