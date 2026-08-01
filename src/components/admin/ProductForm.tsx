"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storageService } from "@/repositories/storage.service";
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
  price: string;
  stock: string;
  description: string;
  material: string;
  size: string;
  certification: string;
};

type ProductFormInitialData = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  specs: unknown;
};

export function ProductForm({
  initialData,
}: {
  initialData?: ProductFormInitialData;
}) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const specData =
    initialData?.specs && typeof initialData.specs === "object"
      ? (initialData.specs as Record<string, string>)
      : {};

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, { error: t("nameRequired") }),
        category: z.string().trim().min(1, { error: t("categoryRequired") }),
        price: z
          .string()
          .min(1, { error: t("priceRequired") })
          .regex(/^\d+$/, { error: t("priceInvalid") }),
        stock: z
          .string()
          .min(1, { error: t("stockRequired") })
          .regex(/^\d+$/, { error: t("stockInvalid") }),
        description: z.string(),
        material: z.string(),
        size: z.string(),
        certification: z.string(),
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
      price: initialData ? String(initialData.price) : "",
      stock: initialData ? String(initialData.stock) : "0",
      description: initialData?.description ?? "",
      material: specData.material ?? "",
      size: specData.size ?? "",
      certification: specData.certification ?? "",
    },
  });

  async function handleImageChange(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(t("imageTypeInvalid"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }
    setUploading(true);
    try {
      const path = `products/${crypto.randomUUID()}-${file.name}`;
      const url = await storageService.upload(file, path);
      setImageUrl(url);
      toast.success(t("imageUploaded"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("imageUploadError"),
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description,
      imageUrl,
      specs: {
        material: values.material,
        size: values.size,
        certification: values.certification,
      },
    };

    const result = initialData
      ? await updateProductAction(initialData.id, payload)
      : await createProductAction(payload);

    if (result.ok) {
      toast.success(initialData ? t("updated") : t("created"));
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(result.error);
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
          <label
            htmlFor="product-description"
            className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
          >
            {t("description")}
          </label>
          <Textarea
            id="product-description"
            placeholder={t("descriptionPlaceholder")}
            className="rounded-none border-stone-900"
            {...register("description")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
            {t("image")}
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-none border border-stone-900 bg-stone-50">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
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
                  void handleImageChange(file);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-stone-900 pt-4">
        <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
          {t("specs")}
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="spec-material"
              className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
            >
              {t("specMaterial")}
            </label>
            <Input
              id="spec-material"
              placeholder={t("specMaterialPlaceholder")}
              className="rounded-none border-stone-900"
              {...register("material")}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="spec-size"
              className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
            >
              {t("specSize")}
            </label>
            <Input
              id="spec-size"
              placeholder={t("specSizePlaceholder")}
              className="rounded-none border-stone-900"
              {...register("size")}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="spec-certification"
              className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
            >
              {t("specCertification")}
            </label>
            <Input
              id="spec-certification"
              placeholder={t("specCertificationPlaceholder")}
              className="rounded-none border-stone-900"
              {...register("certification")}
            />
          </div>
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
