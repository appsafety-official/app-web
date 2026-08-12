import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ImageIcon, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productRepository } from "@/repositories/product.repository";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

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
        <div className="overflow-x-auto rounded-none border border-stone-900 bg-white">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-stone-900 bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3">{t("name")}</th>
                <th className="px-4 py-3">{t("category")}</th>
                <th className="px-4 py-3">{t("price")}</th>
                <th className="px-4 py-3">{t("stock")}</th>
                <th className="px-4 py-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-stone-900 bg-stone-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-stone-400" />
                        )}
                      </div>
                      <span className="font-bold text-stone-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{product.category}</td>
                  <td className="px-4 py-3 text-stone-900">
                    Rp {product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href={`/admin/products/${product.id}/edit`} />}
                      >
                        <Pencil />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
