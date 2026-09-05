"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { reorderProductsAction } from "@/app/admin/(shell)/products/actions";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  stock: number;
  imageUrl: string | null;
};

export function ProductListManager({ products }: { products: ProductRow[] }) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const [items, setItems] = useState<ProductRow[]>(products);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function persist(next: ProductRow[]) {
    setItems(next);
    setSaving(true);
    const result = await reorderProductsAction({ ids: next.map((p) => p.id) });
    setSaving(false);
    if (result.ok) {
      toast.success(t("reorderSaved"));
      router.refresh();
    } else {
      toast.error(result.error);
      setItems(products);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void persist(next);
  }

  function handleDragStart(
    event: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
    setDragOverIndex(index);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleDrop(event: React.DragEvent<HTMLTableRowElement>, index: number) {
    event.preventDefault();
    if (draggingIndex === null || draggingIndex === index) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...items];
    const [dragged] = next.splice(draggingIndex, 1);
    next.splice(index, 0, dragged);
    setDraggingIndex(null);
    setDragOverIndex(null);
    void persist(next);
  }

  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="overflow-x-auto rounded-none border border-stone-900 bg-white">
      <table className="w-full font-mono text-sm">
        <thead>
          <tr className="border-b border-stone-900 bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <th className="w-8 px-2 py-3"></th>
            <th className="px-4 py-3">{t("name")}</th>
            <th className="px-4 py-3">{t("category")}</th>
            <th className="px-4 py-3">{t("price")}</th>
            <th className="px-4 py-3">{t("stock")}</th>
            <th className="px-4 py-3">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>



          {items.map((product, index) => (
            <tr
              key={product.id}
              draggable
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={handleDragEnd}
              className={`border-b border-stone-100 last:border-b-0 hover:bg-stone-50 ${
                draggingIndex === index ? "opacity-50" : ""
              } ${
                dragOverIndex === index && draggingIndex !== null && draggingIndex !== index
                  ? "outline outline-1 -outline-offset-1 outline-yellow-500"
                  : ""
              }`}
            >
              <td className="px-2 py-3 align-middle">
                <div className="flex items-center">
                  <span className="hidden cursor-grab text-stone-400 active:cursor-grabbing md:block">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col md:hidden">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0 || saving}
                      aria-label={t("moveProductUp")}
                      className="flex h-4 items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === items.length - 1 || saving}
                      aria-label={t("moveProductDown")}
                      className="flex h-4 items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </td>
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
                  <span className="font-bold text-stone-900">{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-stone-600">{product.category}</td>
              <td className="px-4 py-3 text-stone-900">
                {product.price !== null
                  ? `Rp ${product.price.toLocaleString("id-ID")}`
                  : "—"}
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
  );
}
