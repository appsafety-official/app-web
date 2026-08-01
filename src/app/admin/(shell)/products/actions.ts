"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { productRepository } from "@/repositories/product.repository";
import {
  getStoragePathFromUrl,
  storageService,
} from "@/repositories/storage.service";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  category: z.string().trim().min(1, "Category is required").max(100),
  price: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  specs: z
    .object({
      material: z.string().trim().max(200).optional().or(z.literal("")),
      size: z.string().trim().max(200).optional().or(z.literal("")),
      certification: z
        .string()
        .trim()
        .max(200)
        .optional()
        .or(z.literal("")),
    })
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

function toProductInput(data: z.infer<typeof productSchema>) {
  return {
    name: data.name,
    category: data.category,
    price: data.price,
    stock: data.stock,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    specs: data.specs
      ? {
          material: data.specs.material || undefined,
          size: data.specs.size || undefined,
          certification: data.specs.certification || undefined,
        }
      : undefined,
  };
}

export async function createProductAction(
  input: unknown,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(input);
    const product = await productRepository.create(toProductInput(parsed));
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
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(input);
    const product = await productRepository.update(id, toProductInput(parsed));
    revalidatePath("/admin/products");
    return { ok: true, productId: product.id };
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
    if (existing?.imageUrl) {
      const path = getStoragePathFromUrl(existing.imageUrl);
      if (path) {
        try {
          await storageService.delete(path);
        } catch {
          // best-effort cleanup
        }
      }
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
