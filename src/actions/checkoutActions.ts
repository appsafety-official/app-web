"use server";

import { checkoutSchema, type CheckoutInput } from "@/lib/checkoutSchema";
import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";
import { productRepository } from "@/repositories/product.repository";

const WHATSAPP_NUMBER = "6287824604747";

type CheckoutResult =
  | { ok: true; waUrl: string; orderId: string }
  | { ok: false; error: string };

function buildWaMessage(input: CheckoutInput): string {
  const lines = input.items.map((item) => {
    const subtotal = item.price * item.quantity;
    return `- ${item.name} x${item.quantity} = Rp ${subtotal.toLocaleString("id-ID")}`;
  });
  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return [
    "Halo APP Safety! Saya mau order:",
    ...lines,
    "",
    `Total: Rp ${total.toLocaleString("id-ID")}`,
    "",
    `Nama: ${input.name}`,
    `WhatsApp: ${input.whatsapp}`,
    input.address ? `Alamat: ${input.address}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitCheckout(input: unknown): Promise<CheckoutResult> {
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

    const totalAmount = resolved.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const prospect = await prospectRepository.create({
      name: resolved.name,
      whatsapp: resolved.whatsapp,
      address: resolved.address || null,
      acquisitionChannel: resolved.acquisitionChannel ?? "organic_web",
      status: "warm",
      totalAmount,
      orderItems: resolved.items,
    });

    const message = buildWaMessage(resolved);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    return { ok: true, waUrl, orderId: prospect.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
