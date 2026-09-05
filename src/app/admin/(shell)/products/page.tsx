import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productRepository } from "@/repositories/product.repository";
import { ProductListManager } from "@/components/admin/ProductListManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const t = await getTranslations("admin.products");
  const products = await productRepository.findAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
            {t("title")}
          </h1>
          <p className="mt-1 font-mono text-sm text-stone-500">{t("subtitle")}</p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/admin/products/new" />
          }
          className="rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
        >
          <Plus />
          {t("addProduct")}
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="rounded-none border border-stone-900 bg-white p-6 font-mono text-sm text-stone-500">
          {t("empty")}
        </p>
      ) : (
        <ProductListManager
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl,
          }))}
        />
      )}
    </div>
  );
}
