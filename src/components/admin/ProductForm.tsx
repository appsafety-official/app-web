"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, Plus, Trash2, Upload, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { SpecPair } from "@/repositories/interfaces/IProductRepository";
import { normalizeSpecs } from "@/lib/product-specs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProductAction,
  updateProductAction,
} from "@/app/admin/(shell)/products/actions";

const productCategories = [
  "Firefighting",
  "Welding",
  "Hazmat",
  "Hand Protection",
] as const;

type ProductFormValues = {
  name: string;
  category: string;
  price?: string;
  stock: string;
  description: string;
  specs: SpecPair[];
};

type ProductFormInitialData = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  imageGallery: string[];
  specs: unknown;
};

type GalleryItem =
  | { type: 'kept'; url: string; id: string }
  | { type: 'new'; file: File; preview: string; id: string };

export function ProductForm({
  initialData,
}: {
  initialData?: ProductFormInitialData;
}) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const specData = normalizeSpecs(initialData?.specs);

  // Initialize unified gallery items
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];
    initialData?.imageGallery?.forEach((url, index) => {
      items.push({ type: 'kept', url, id: `kept-${index}-${url}` });
    });
    return items;
  });

  // Derived state for backward compatibility with submit
  const keptGallery = galleryItems
    .filter((item): item is GalleryItem & { type: 'kept' } => item.type === 'kept')
    .map((item) => item.url);
  const galleryFiles = galleryItems
    .filter((item): item is GalleryItem & { type: 'new' } => item.type === 'new')
    .map((item) => ({ file: item.file, preview: item.preview }));

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, { error: t("nameRequired") }),
        category: z.string().trim().min(1, { error: t("categoryRequired") }),
        price: z
          .string()
          .regex(/^\d+$/, { error: t("priceInvalid") })
          .optional()
          .or(z.literal("")),
        stock: z
          .string()
          .min(1, { error: t("stockRequired") })
          .regex(/^\d+$/, { error: t("stockInvalid") }),
        description: z.string(),
        specs: z.array(
          z.object({
            key: z.string().trim().max(200),
            value: z.string().trim().max(1000),
          }),
        ),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      category: initialData?.category ?? "",
      price: initialData?.price != null ? String(initialData.price) : "",
      stock: initialData ? String(initialData.stock) : "0",
      description: initialData?.description ?? "",
      specs: specData.length > 0 ? specData : [{ key: "", value: "" }],
    },
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specs",
  });

  function handleImageChange(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(t("imageTypeInvalid"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleGalleryFiles(files: File[]) {
    const valid: GalleryItem[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("imageTypeInvalid"));
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("imageTooLarge"));
        continue;
      }
      valid.push({
        type: "new",
        file,
        preview: URL.createObjectURL(file),
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
    }
    if (valid.length > 0) {
      setGalleryItems((prev) => [...prev, ...valid]);
    }
  }

  function removeGalleryItem(id: string) {
    setGalleryItems((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item?.type === "new") {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((entry) => entry.id !== id);
    });
  }

  // Drag and drop handlers
  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) {
    // Required: without setData the browser never initiates a valid drag
    // (Firefox won't start one at all, Chrome's drop won't fire reliably)
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
    setDragOverIndex(index);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    index: number,
  ) {
    event.preventDefault();

    if (draggingIndex === null || draggingIndex === index) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    setGalleryItems((prev) => {
      const newItems = [...prev];
      const [draggedItem] = newItems.splice(draggingIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });

    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  // Touch-device fallback: HTML5 drag & drop doesn't exist on touch screens
  function moveGalleryItem(from: number, to: number) {
    setGalleryItems((prev) => {
      if (to < 0 || to >= prev.length || from === to) {
        return prev;
      }
      const newItems = [...prev];
      const [movedItem] = newItems.splice(from, 1);
      newItems.splice(to, 0, movedItem);
      return newItems;
    });
  }

  async function onSubmit(values: ProductFormValues) {
    if (!imageFile && !imagePreview) {
      toast.error(t("imageRequired"));
      return;
    }
    setUploading(true);
    try {
      const payload = {
        name: values.name,
        category: values.category,
        price: values.price ? Number(values.price) : null,
        stock: Number(values.stock),
        description: values.description,
        imageUrl: initialData?.imageUrl ?? "",
        imageGallery: keptGallery,
        specs: values.specs
          .map((spec) => ({ key: spec.key.trim(), value: spec.value.trim() }))
          .filter((spec) => spec.key !== "" || spec.value !== ""),
      };

      const result = initialData
        ? await updateProductAction(
            initialData.id,
            payload,
            imageFile,
            galleryFiles.map((item) => item.file),
          )
        : await createProductAction(
            payload,
            imageFile,
            galleryFiles.map((item) => item.file),
          );

      if (result.ok) {
        toast.success(initialData ? t("updated") : t("created"));
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 rounded-none border border-stone-900 bg-white p-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="product-name"
            className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
          >
            {t("name")}
          </label>
          <Input
            id="product-name"
            placeholder={t("namePlaceholder")}
            className="rounded-none border-stone-900"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name && (
            <p className="font-mono text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
            {t("category")}
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full rounded-none border-stone-900">
                  <SelectValue placeholder={t("categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="font-mono text-xs text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="product-price"
            className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
          >
            {t("price")}
          </label>
          <Input
            id="product-price"
            inputMode="numeric"
            placeholder="2500000"
            className="rounded-none border-stone-900"
            aria-invalid={Boolean(errors.price)}
            {...register("price")}
          />
          {errors.price && (
            <p className="font-mono text-xs text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="product-stock"
            className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
          >
            {t("stock")}
          </label>
          <Input
            id="product-stock"
            inputMode="numeric"
            placeholder="10"
            className="rounded-none border-stone-900"
            aria-invalid={Boolean(errors.stock)}
            {...register("stock")}
          />
          {errors.stock && (
            <p className="font-mono text-xs text-red-600">{errors.stock.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
            {t("description")}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder={t("descriptionPlaceholder")}
              />
            )}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
            {t("image")}
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-none border border-stone-900 bg-stone-100">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-stone-400" />
              )}
            </div>
            <label
              htmlFor="product-image"
              className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? t("uploading") : t("chooseImage")}
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleImageChange(file);
                }
                event.target.value = "";
              }}
            />
          </div>

          <div className="mt-4 border-t border-stone-900 pt-4">
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
              {t("imageGallery")}
            </p>
            <p className="mb-3 text-xs text-stone-500">
              {t("imageGalleryHint")}
            </p>
            {galleryItems.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {galleryItems.map((item, index) => (
                  <div
                    key={item.id}
                    data-gallery-item
                    draggable
                    onDragStart={(event) => handleDragStart(event, index)}
                    onDragOver={(event) => handleDragOver(event, index)}
                    onDrop={(event) => handleDrop(event, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative flex h-20 items-center justify-center overflow-hidden rounded-none border bg-stone-100 transition-colors ${
                      dragOverIndex === index && draggingIndex !== null && draggingIndex !== index
                        ? "border-yellow-500"
                        : "border-stone-900"
                    } ${draggingIndex === index ? "opacity-50" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.type === "kept" ? item.url : item.preview}
                      alt=""
                      draggable={false}
                      className="pointer-events-none h-full w-full select-none object-cover object-center"
                    />
                    <span className="absolute bottom-0 left-0 hidden h-5 w-5 cursor-grab items-center justify-center bg-stone-900/70 text-white active:cursor-grabbing md:flex">
                      <GripVertical className="h-3 w-3" />
                    </span>
                    <div className="absolute bottom-0 left-0 flex md:hidden">
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(index, index - 1)}
                        disabled={index === 0}
                        className="flex h-5 w-5 items-center justify-center bg-stone-900/70 text-white disabled:opacity-40"
                        aria-label={t("moveImageLeft")}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(index, index + 1)}
                        disabled={index === galleryItems.length - 1}
                        className="flex h-5 w-5 items-center justify-center bg-stone-900/70 text-white disabled:opacity-40"
                        aria-label={t("moveImageRight")}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(item.id)}
                      className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-stone-900 text-white transition-colors hover:bg-red-600"
                      aria-label={t("removeImage")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              htmlFor="product-gallery"
              className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
            >
              <Upload className="h-4 w-4" /> {t("addGalleryImages")}
            </label>
            <input
              id="product-gallery"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length > 0) {
                  handleGalleryFiles(files);
                }
                event.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-stone-900 pt-4">
        <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
          {t("specs")}
        </p>
        <div className="space-y-3">
          {specFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <label
                  htmlFor={`spec-${index}-key`}
                  className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
                >
                  {t("specKey")}
                </label>
                <Input
                  id={`spec-${index}-key`}
                  placeholder={t("specKeyPlaceholder")}
                  className="rounded-none border-stone-900"
                  {...register(`specs.${index}.key`)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`spec-${index}-value`}
                  className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
                >
                  {t("specValue")}
                </label>
                <Input
                  id={`spec-${index}-value`}
                  placeholder={t("specValuePlaceholder")}
                  className="rounded-none border-stone-900"
                  {...register(`specs.${index}.value`)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeSpec(index)}
                  disabled={specFields.length <= 1}
                  className="rounded-none border-stone-900"
                  aria-label={t("removeSpec")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendSpec({ key: "", value: "" })}
            className="rounded-none border-stone-900 font-mono text-xs font-bold uppercase tracking-widest"
          >
            <Plus className="h-4 w-4" /> {t("addSpec")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
        >
          {isSubmitting ? t("saving") : initialData ? t("save") : t("create")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          className="rounded-none border-stone-900 font-mono text-sm uppercase tracking-widest"
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
