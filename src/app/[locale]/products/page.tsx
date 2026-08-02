"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import ProductCard from "@/components/public/ProductCard";

const allProducts = [
  { id: "dummy-1", nameKey: "fireProximitySuit", category: "FIREFIGHTING", price: 2500000 },
  { id: "dummy-2", nameKey: "weldingJacket", category: "WELDING", price: 850000 },
  { id: "dummy-3", nameKey: "beekeeperSuit", category: "HAZMAT", price: 1200000 },
  { id: "dummy-4", nameKey: "impactGloves", category: "HAND PROTECTION", price: 350000 },
];

const categoryKeys = ["all", "firefighting", "welding", "hazmat", "handProtection"];

export default function ProductsPage() {
  const t = useTranslations("products");
  const pt = useTranslations("products.products");
  const ct = useTranslations("products.categories");

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const products = allProducts.map((p) => ({
    ...p,
    name: pt(p.nameKey),
  }));

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === "ALL" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="mb-6 font-mono text-xs tracking-wider text-gray-400">
        {t("breadcrumb")}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
            {t("subtitle")}
          </p>
        </div>
        <span className="mt-2 shrink-0 self-start rounded-sm border border-gray-200 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-gray-500 sm:mt-0">
          {t("sku", { count: filtered.length, total: allProducts.length })}
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-b border-t border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key === "all" ? "ALL" : key.toUpperCase())}
              className={`rounded-sm px-4 py-2 font-mono text-[11px] font-semibold tracking-wider transition-colors ${
                (key === "all" && activeCategory === "ALL") || activeCategory === key.toUpperCase()
                  ? "bg-black text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              {ct(key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 rounded-sm border border-gray-200 py-2 pl-9 pr-3 text-sm text-black placeholder-gray-400 outline-none transition-colors focus:border-gray-400"
            />
          </div>
          <div className="relative flex items-center">
            <SlidersHorizontal className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <select
              className="w-36 appearance-none rounded-sm border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-600 outline-none transition-colors focus:border-gray-400"
              defaultValue="Featured"
            >
              <option>{t("sortFeatured")}</option>
              <option>{t("sortPriceLowHigh")}</option>
              <option>{t("sortPriceHighLow")}</option>
              <option>{t("sortNameAZ")}</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mt-4 font-mono text-[11px] tracking-wider text-gray-400 sm:hidden">
        {t("sku", { count: filtered.length, total: allProducts.length })}
      </p>

      <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center font-mono text-sm text-gray-400">
          {t("noResults")}
        </p>
      )}
    </div>
  );
}
