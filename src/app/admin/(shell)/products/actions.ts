"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import { sanitizeProductDescription } from "@/lib/sanitize-product-description";
import {
  PRODUCT_IMAGE_BUCKET,
  storageService,
} from "@/repositories/storage.service";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  category: z.string().trim().min(1, "Category is required").max(100),
  price: z.coerce.number().int().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  description: z.string().trim().max(20000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageGallery: z.array(z.string().url()).max(30).optional(),
  specs: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(200),
        value: z.string().trim().min(1).max(1000),
      }),
    )
    .max(50)
    .optional(),
});

export type ProductActionResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

type ProductInput = Omit<
  z.infer<typeof productSchema>,
  "imageUrl" | "imageGallery"
> & {
  imageUrl?: string | null;
  imageGallery: string[];
};

function toProductInput(data: ProductInput) {
  return {
    name: data.name,
    category: data.category,
    price: data.price,
    stock: data.stock,
    description: sanitizeProductDescription(data.description),
    imageUrl: data.imageUrl || null,
    imageGallery: data.imageGallery,
    specs: data.specs || undefined,
  };
}

async function uploadGalleryFiles(
  files: File[] | undefined,
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files ?? []) {
    if (file.size > 0) {
      urls.push(await storageService.upload(file, PRODUCT_IMAGE_BUCKET));
    }
  }
  return urls;
}

async function deleteGalleryFiles(urls: string[]) {
  for (const url of urls) {
    try {
      await storageService.delete(url, PRODUCT_IMAGE_BUCKET);
    } catch {
      // best-effort cleanup
    }
  }
}

async function cleanupImage(existing: { imageUrl: string | null }) {
  if (!existing.imageUrl) return;
  try {
    await storageService.delete(existing.imageUrl, PRODUCT_IMAGE_BUCKET);
  } catch {
    // best-effort cleanup
  }
}

export async function createProductAction(
  input: unknown,
  imageFile?: File | null,
  galleryFiles?: File[],
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(input);
    let imageUrl = parsed.imageUrl || null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await storageService.upload(imageFile, PRODUCT_IMAGE_BUCKET);
    }
    const uploadedGallery = await uploadGalleryFiles(galleryFiles);
    const product = await productRepository.create(
      toProductInput({
        ...parsed,
        imageUrl,
        imageGallery: [...(parsed.imageGallery ?? []), ...uploadedGallery],
      }),
    );
    revalidatePath("/admin/products");
    return { ok: true, productId: product.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

export async function updateProductAction(
  id: string,
  input: unknown,
  imageFile?: File | null,
  galleryFiles?: File[],
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(input);
    const existing = await productRepository.findById(id);
    if (!existing) throw new Error("Product not found");
    let imageUrl = parsed.imageUrl || null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await storageService.upload(imageFile, PRODUCT_IMAGE_BUCKET);
      await cleanupImage(existing);
    }
    const uploadedGallery = await uploadGalleryFiles(galleryFiles);
    const nextGallery = [...(parsed.imageGallery ?? []), ...uploadedGallery];
    const removedGallery = existing.imageGallery.filter(
      (url) => !nextGallery.includes(url),
    );
    await deleteGalleryFiles(removedGallery);
    const product = await productRepository.update(
      id,
      toProductInput({
        ...parsed,
        imageUrl,
        imageGallery: nextGallery,
      }),
    );
    revalidatePath("/admin/products");
    return { ok: true, productId: product.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function reorderProductsAction(
  input: unknown,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.parse(input);
    const existing = await productRepository.findAll();
    const existingIds = new Set(existing.map((p) => p.id));
    const allPresent =
      parsed.ids.length === existing.length &&
      parsed.ids.every((id) => existingIds.has(id));
    if (!allPresent) throw new Error("Invalid product order payload");
    await productRepository.reorder(parsed.ids);
    revalidatePath("/admin/products");
    return { ok: true, productId: parsed.ids[0] };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const existing = await productRepository.findById(id);
    if (existing) {
      await cleanupImage(existing);
      await deleteGalleryFiles(existing.imageGallery);
    }
    await productRepository.delete(id);
    revalidatePath("/admin/products");
    return { ok: true, productId: id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
