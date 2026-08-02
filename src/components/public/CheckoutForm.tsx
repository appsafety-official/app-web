"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { checkoutSchema } from "@/lib/checkoutSchema";
import { submitCheckout } from "@/actions/checkoutActions";
import { useCartStore } from "@/store/useCartStore";

const formSchema = checkoutSchema.pick({ name: true, whatsapp: true, address: true });
type CheckoutFormValues = z.infer<typeof formSchema>;

export function CheckoutForm() {
  const t = useTranslations("common.checkout");
  const { items, clearCart } = useCartStore();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", whatsapp: "", address: "" },
  });

  async function onSubmit(values: CheckoutFormValues) {
    setPending(true);
    const result = await submitCheckout({
      name: values.name,
      whatsapp: values.whatsapp,
      address: values.address,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    setPending(false);

    if (result.ok) {
      toast.success(t("success"));
      clearCart();
      window.open(result.waUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label
          htmlFor="checkout-name"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("name")}
        </label>
        <Input
          id="checkout-name"
          placeholder={t("namePlaceholder")}
          className="rounded-none border-stone-900 font-mono text-sm"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 font-mono text-xs text-red-600">{t("errorName")}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="checkout-whatsapp"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("whatsapp")}
        </label>
        <Input
          id="checkout-whatsapp"
          placeholder={t("whatsappPlaceholder")}
          className="rounded-none border-stone-900 font-mono text-sm"
          {...register("whatsapp")}
        />
        {errors.whatsapp && (
          <p className="mt-1 font-mono text-xs text-red-600">{t("errorWhatsapp")}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="checkout-address"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("address")}
        </label>
        <Textarea
          id="checkout-address"
          rows={2}
          placeholder={t("addressPlaceholder")}
          className="rounded-none border-stone-900 font-mono text-sm"
          {...register("address")}
        />
        {errors.address && (
          <p className="mt-1 font-mono text-xs text-red-600">{t("errorAddress")}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-none border border-stone-900 bg-yellow-500 font-mono text-sm font-bold uppercase tracking-widest text-stone-900 hover:bg-stone-900 hover:text-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
