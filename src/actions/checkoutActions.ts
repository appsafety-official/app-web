"use server";

import { checkoutSchema, type CheckoutInput } from "@/lib/checkoutSchema";
import { buildWaUrl } from "@/lib/whatsapp";
import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";
import { productRepository } from "@/repositories/product.repository";

type CheckoutResult =
  | { ok: true; waUrl: string; orderId: string }
  | { ok: false; error: string };

function buildWaMessage(input: CheckoutInput): string {
  const lines = input.items.map(
    (item) => `- ${item.name} x${item.quantity}`,
  );
  return [
    "Halo APP Safety! Saya ingin minta penawaran untuk:",
    ...lines,
    input.notes ? `Catatan: ${input.notes}` : "",
    "",
    `Nama: ${input.name}`,
    `WhatsApp: ${input.whatsapp}`,
    input.email ? `Email: ${input.email}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitQuoteRequest(input: unknown): Promise<CheckoutResult> {
  try {
    const parsed = checkoutSchema.parse(input);

    const resolvedItems = await Promise.all(
      parsed.items.map(async (item) => {
        const product = await productRepository.findById(item.productId);
        if (!product) {
          throw new Error(`Produk tidak ditemukan (${item.productId})`);
        }
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      }),
    );

    const resolved: CheckoutInput = {
      ...parsed,
      items: resolvedItems,
    };

    // Reference total from internal baseline prices; unpriced items are skipped.
    const totalAmount = resolved.items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    );

    const prospect = await prospectRepository.create({
      name: resolved.name,
      whatsapp: resolved.whatsapp,
      acquisitionChannel: resolved.acquisitionChannel ?? "web_quote",
      status: "cold",
      totalAmount,
      orderItems: resolved.items,
    });

    const message = buildWaMessage(resolved);
    const waUrl = buildWaUrl(message);

    return { ok: true, waUrl, orderId: prospect.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
