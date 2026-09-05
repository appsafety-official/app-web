import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive().nullable(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(2),
  whatsapp: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+?62|0)8\d{7,12}$/)),
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(cartItemSchema).min(1),
  acquisitionChannel: z
    .enum(["organic_web", "web_buy_now", "web_quote"])
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
