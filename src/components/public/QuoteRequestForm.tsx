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
import { submitQuoteRequest } from "@/actions/checkoutActions";
import type { QuoteProduct } from "@/store/useQuoteStore";

const formSchema = checkoutSchema.pick({
  name: true,
  whatsapp: true,
  email: true,
  notes: true,
});
type QuoteFormValues = z.infer<typeof formSchema>;

interface QuoteRequestFormProps {
  product: QuoteProduct;
  quantity: number;
  onSuccess?: () => void;
}

export function QuoteRequestForm({ product, quantity, onSuccess }: QuoteRequestFormProps) {
  const t = useTranslations("common.quote");
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", whatsapp: "", email: "", notes: "" },
  });

  async function onSubmit(values: QuoteFormValues) {
    setPending(true);
    const result = await submitQuoteRequest({
      name: values.name,
      whatsapp: values.whatsapp,
      email: values.email,
      notes: values.notes,
      items: [
        {
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity,
        },
      ],
      acquisitionChannel: "web_quote",
    });
    setPending(false);

    if (result.ok) {
      toast.success(t("success"));
      onSuccess?.();
      window.open(result.waUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label
          htmlFor="quote-name"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("name")}
        </label>
        <Input
          id="quote-name"
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
          htmlFor="quote-whatsapp"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("whatsapp")}
        </label>
        <Input
          id="quote-whatsapp"
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
          htmlFor="quote-email"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("email")}
        </label>
        <Input
          id="quote-email"
          type="email"
          placeholder={t("emailPlaceholder")}
          className="rounded-none border-stone-900 font-mono text-sm"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 font-mono text-xs text-red-600">{t("errorEmail")}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="quote-notes"
          className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900"
        >
          {t("notes")}
        </label>
        <Textarea
          id="quote-notes"
          rows={2}
          placeholder={t("notesPlaceholder")}
          className="rounded-none border-stone-900 font-mono text-sm"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="mt-1 font-mono text-xs text-red-600">{t("errorNotes")}</p>
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
