"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const productMap: Record<string, {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  description: string;
  specs: { material: string; size: string; certification: string };
}> = {
  "dummy-1": {
    id: "dummy-1",
    name: "Aluminized Fire Proximity Suit",
    category: "firefighting",
    categoryLabel: "FIREFIGHTING",
    price: 2500000,
    description:
      "High-performance aluminized proximity suit designed for extreme heat environments up to 1000°C. Reflective outer layer protects against radiant heat while the inner insulation provides thermal barrier. Ideal for foundries, kiln operations, and firefighting scenarios.",
    specs: { material: "Aluminized Kevlar / Nomex", size: "M, L, XL, XXL", certification: "ISO 11612, NFPA 1971" },
  },
  "dummy-2": {
    id: "dummy-2",
    name: "Nomex Welding Jacket",
    category: "welding",
    categoryLabel: "WELDING",
    price: 850000,
    description:
      "Premium Nomex IIIA welding jacket with superior flame resistance and durability. Designed for welders who demand comfort without compromising safety. Features snap-button closure and reinforced seams.",
    specs: { material: "Nomex IIIA 245 gsm", size: "L, XL, XXL", certification: "ISO 11611, ASTM F1506" },
  },
  "dummy-3": {
    id: "dummy-3",
    name: "Beekeeper Suit Ventilated",
    category: "hazmat",
    categoryLabel: "HAZMAT",
    price: 1200000,
    description:
      "Full-body ventilated beekeeper suit with integrated veil and elastic cuffs. Lightweight breathable fabric keeps you cool during extended use. Zippered front with double flap prevents any gaps.",
    specs: { material: "Polycotton 210T + Mesh", size: "M, L, XL", certification: "EN 13034, EN ISO 13688" },
  },
  "dummy-4": {
    id: "dummy-4",
    name: "Heavy Duty Impact Gloves",
    category: "hand_protection",
    categoryLabel: "HAND PROTECTION",
    price: 350000,
    description:
      "TPR-impact rated gloves with reinforced palm and finger protection. Designed for heavy machinery operations, mining, and construction. Hook-and-loop wrist closure ensures secure fit.",
    specs: { material: "Synthetic Leather + TPR", size: "S, M, L, XL", certification: "EN 388, EN 13594" },
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const product = productMap[params.id as string];
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-sm text-stone-500">Product not found.</p>
        <Link
          href="/products"
          className="mt-4 inline-block border border-stone-900 px-6 py-3 text-sm font-bold transition-colors hover:bg-stone-100"
        >
          BACK TO CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/products"
        className="mb-8 flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> BACK TO CATALOG
      </Link>

      <div className="grid gap-8 sm:grid-cols-2">
        {/* Image placeholder */}
        <div className="aspect-square flex items-center justify-center border border-stone-900 bg-stone-200">
          <span className="text-4xl tracking-widest text-stone-400">[IMG]</span>
        </div>

        {/* Details */}
        <div>
          <span className="inline-block border border-stone-900 px-3 py-1 text-[10px] font-bold tracking-widest text-stone-600">
            {product.categoryLabel}
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-stone-900">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-stone-600">
            {product.description}
          </p>

          {/* Specs Table */}
          <div className="mt-6 border border-stone-900">
            {(["material", "size", "certification"] as const).map((key) => (
              <div
                key={key}
                className="flex border-b border-stone-900 last:border-b-0"
              >
                <span className="w-28 border-r border-stone-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {key}
                </span>
                <span className="flex-1 px-3 py-2 text-xs">
                  {product.specs[key]}
                </span>
              </div>
            ))}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-stone-900">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 transition-colors hover:bg-stone-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3ch] text-center text-sm font-bold">{qty}</span>
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
              addItem({ productId: product.id, name: product.name, price: product.price });
            }}
            className="mt-4 w-full border border-stone-900 bg-stone-900 px-6 py-3 text-sm font-bold text-safety transition-colors hover:bg-stone-800"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
