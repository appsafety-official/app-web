"use server";

import { checkoutSchema, type CheckoutInput } from "@/lib/checkoutSchema";
import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";

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
    const totalAmount = parsed.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const prospect = await prospectRepository.create({
      name: parsed.name,
      whatsapp: parsed.whatsapp,
      address: parsed.address || null,
      acquisitionChannel: "organic_web",
      status: "warm",
      totalAmount,
      orderItems: parsed.items,
    });

    const message = buildWaMessage(parsed);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    return { ok: true, waUrl, orderId: prospect.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
