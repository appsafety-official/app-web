"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureLeadMagnetDownload } from "@/actions/prospectActions";
import type { LeadMagnetData } from "@/repositories/interfaces/ILeadMagnetRepository";

type LeadMagnetWidgetProps = {
  leadMagnet: LeadMagnetData;
};

export function LeadMagnetWidget({ leadMagnet }: LeadMagnetWidgetProps) {
  const t = useTranslations("leadMagnet");
  const [downloading, setDownloading] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(1, { error: t("nameRequired") }),
    whatsapp: z
      .string()
      .trim()
      .min(10, { error: t("whatsappInvalid") })
      .regex(/^[0-9+\s()-]+$/, { error: t("whatsappInvalid") }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; whatsapp: string }>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: { name: string; whatsapp: string }) {
    setDownloading(true);
    try {
      const result = await captureLeadMagnetDownload({
        name: values.name,
        whatsapp: values.whatsapp,
        leadMagnetId: leadMagnet.id,
      });
      if (result.ok) {
        toast.success(t("success"));
        reset();
        window.open(leadMagnet.pdfUrl, "_blank");
      } else {
        toast.error(result.error);
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="border-y border-stone-900 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 border border-stone-900 bg-white p-8 sm:grid-cols-2 sm:p-12">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-500">
              <Download className="h-4 w-4 text-yellow-500" />
              {t("title")}
            </p>
            <h2 className="font-mono text-2xl font-bold uppercase tracking-wider text-stone-900 sm:text-3xl">
              {leadMagnet.title}
            </h2>
            {leadMagnet.description && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
                {leadMagnet.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="lm-name"
                className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
              >
                {t("name")}
              </label>
              <Input
                id="lm-name"
                placeholder={t("namePlaceholder")}
                className="rounded-none border-stone-900"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className="font-mono text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lm-whatsapp"
                className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
              >
                {t("whatsapp")}
              </label>
              <Input
                id="lm-whatsapp"
                inputMode="tel"
                placeholder={t("whatsappPlaceholder")}
                className="rounded-none border-stone-900"
                aria-invalid={Boolean(errors.whatsapp)}
                {...register("whatsapp")}
              />
              {errors.whatsapp && (
                <p className="font-mono text-xs text-red-600">
                  {errors.whatsapp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={downloading}
              className="w-full rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("downloading")}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {t("download")}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
