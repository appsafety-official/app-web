"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureLeadMagnetDownload } from "@/actions/prospectActions";
import type { LeadMagnetData } from "@/repositories/interfaces/ILeadMagnetRepository";

type LeadMagnetWidgetProps = {
  leadMagnet: LeadMagnetData;
};

export function LeadMagnetWidget({ leadMagnet }: LeadMagnetWidgetProps) {
  const t = useTranslations("leadMagnet");
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-none border border-stone-900 bg-stone-900 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 transition-colors hover:bg-yellow-500 hover:text-stone-900"
      >
        <Download className="h-4 w-4" />
        {t("cta")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={leadMagnet.description ?? ""}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl border-2 border-stone-900 bg-stone-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-900 p-4">
              <div>
                <p className="mb-1 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-500">
                  <Download className="h-4 w-4 text-yellow-500" />
                  {t("title")}
                </p>
                <h2 className="font-mono text-xl font-bold uppercase tracking-wider text-stone-900">
                  {leadMagnet.title}
                </h2>
                {leadMagnet.description && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                    {leadMagnet.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="p-2 transition-colors hover:bg-stone-900 hover:text-yellow-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4 bg-white p-6"
            >
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
      )}
    </>
  );
}