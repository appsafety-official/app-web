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
  price: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  description: z.string().trim().max(20000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
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

type ProductInput = Omit<z.infer<typeof productSchema>, "imageUrl"> & {
  imageUrl?: string | null;
};

function toProductInput(data: ProductInput) {
  return {
    name: data.name,
    category: data.category,
    price: data.price,
    stock: data.stock,
    description: sanitizeProductDescription(data.description),
    imageUrl: data.imageUrl || null,
    specs: data.specs || undefined,
  };
}

export async function createProductAction(
  input: unknown,
  imageFile?: File | null,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(input);
    let imageUrl = parsed.imageUrl || null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await storageService.upload(imageFile, PRODUCT_IMAGE_BUCKET);
    }
    const product = await productRepository.create(
      toProductInput({ ...parsed, imageUrl }),
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
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(input);
    const existing = await productRepository.findById(id);
    if (!existing) throw new Error("Product not found");
    let imageUrl = parsed.imageUrl || null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await storageService.upload(imageFile, PRODUCT_IMAGE_BUCKET);
      if (existing.imageUrl) {
        try {
          await storageService.delete(existing.imageUrl, PRODUCT_IMAGE_BUCKET);
        } catch {
          // best-effort cleanup
        }
      }
    }
    const product = await productRepository.update(
      id,
      toProductInput({ ...parsed, imageUrl }),
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

export async function deleteProductAction(
  id: string,
): Promise<ProductActionResult> {
  try {
    await requireAdmin();
    const existing = await productRepository.findById(id);
    if (existing?.imageUrl) {
      try {
        await storageService.delete(existing.imageUrl, PRODUCT_IMAGE_BUCKET);
      } catch {
        // best-effort cleanup
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
