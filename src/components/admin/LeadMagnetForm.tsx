"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createLeadMagnet, updateLeadMagnet } from "@/actions/leadMagnetActions";

type LeadMagnetFormValues = {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isActive: boolean;
};

type LeadMagnetFormInitialData = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  pdfUrl: string;
  isActive: boolean;
};

export function LeadMagnetForm({
  initialData,
}: {
  initialData?: LeadMagnetFormInitialData;
}) {
  const t = useTranslations("admin.leadMagnets");
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(1, { error: t("titleRequired") }),
        titleEn: z.string().trim().max(200),
        description: z.string().trim().max(500),
        descriptionEn: z.string().trim().max(500),
        isActive: z.boolean(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      titleEn: initialData?.titleEn ?? "",
      description: initialData?.description ?? "",
      descriptionEn: initialData?.descriptionEn ?? "",
      isActive: initialData?.isActive ?? false,
    },
  });

  function handlePdfChange(file: File) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error(t("pdfTypeInvalid"));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("pdfTooLarge"));
      return;
    }
    setPdfFile(file);
    toast.success(t("pdfSelected"));
  }

  async function onSubmit(values: LeadMagnetFormValues) {
    setUploading(true);
    try {
      const payload = {
        title: values.title,
        titleEn: values.titleEn,
        description: values.description,
        descriptionEn: values.descriptionEn,
        pdfUrl: initialData?.pdfUrl ?? "",
        isActive: values.isActive,
      };
      const result = initialData
        ? await updateLeadMagnet(initialData.id, payload, pdfFile)
        : await createLeadMagnet(payload, pdfFile);
      if (result.ok) {
        toast.success(initialData ? t("updated") : t("created"));
        router.push("/admin/lead-magnets");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 rounded-none border border-stone-900 bg-white p-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="leadmagnet-title"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("titleLabel")}
        </label>
        <Input
          id="leadmagnet-title"
          placeholder={t("titlePlaceholder")}
          className="rounded-none border-stone-900"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        {errors.title && (
          <p className="font-mono text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="leadmagnet-title-en"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("titleEnLabel")}
        </label>
        <Input
          id="leadmagnet-title-en"
          placeholder={t("titleEnPlaceholder")}
          className="rounded-none border-stone-900"
          aria-invalid={Boolean(errors.titleEn)}
          {...register("titleEn")}
        />
        {errors.titleEn && (
          <p className="font-mono text-xs text-red-600">
            {errors.titleEn.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="leadmagnet-description"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("descriptionLabel")}
        </label>
        <Textarea
          id="leadmagnet-description"
          rows={3}
          placeholder={t("descriptionPlaceholder")}
          className="rounded-none border-stone-900"
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="leadmagnet-description-en"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("descriptionEnLabel")}
        </label>
        <Textarea
          id="leadmagnet-description-en"
          rows={3}
          placeholder={t("descriptionEnPlaceholder")}
          className="rounded-none border-stone-900"
          {...register("descriptionEn")}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
          {t("pdfLabel")}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex h-14 flex-1 items-center gap-2 overflow-hidden rounded-none border border-stone-900 bg-stone-50 px-3">
            <FileText className="h-5 w-5 shrink-0 text-stone-500" />
            <span className="truncate font-mono text-sm text-stone-700">
              {pdfFile
                ? pdfFile.name
                : initialData
                  ? initialData.pdfUrl.split("/").pop()
                  : t("noFile")}
            </span>
          </div>
          <label
            htmlFor="leadmagnet-pdf"
            className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t("chooseFile")}
          </label>
          <input
            id="leadmagnet-pdf"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handlePdfChange(file);
              }
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
          {t("statusLabel")}
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-none border-stone-900 accent-stone-900"
            {...register("isActive")}
          />
          <span className="font-mono text-sm text-stone-700">{t("activeToggle")}</span>
        </label>
        <p className="font-mono text-[11px] text-stone-400">{t("activeHint")}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || uploading}
          className="rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
        >
          {isSubmitting || uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : initialData ? (
            t("save")
          ) : (
            t("create")
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/lead-magnets")}
          className="rounded-none border-stone-900 font-mono text-sm uppercase tracking-widest"
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
