"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPost, updatePost } from "@/actions/postActions";

type BlogFormValues = {
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
};

type BlogFormInitialData = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  published: boolean;
};

export function BlogForm({
  initialData,
}: {
  initialData?: BlogFormInitialData;
}) {
  const t = useTranslations("admin.blog");
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.coverUrl ?? "");

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(1, { error: t("titleRequired") }),
        excerpt: z.string().trim().max(500, { error: t("excerptTooLong") }),
        content: z.string().trim().min(1, { error: t("contentRequired") }),
        published: z.boolean(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      published: initialData?.published ?? false,
    },
  });

  function handleCoverChange(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(t("imageTypeInvalid"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function onSubmit(values: BlogFormValues) {
    const result = initialData
      ? await updatePost(initialData.id, values, coverFile)
      : await createPost(values, coverFile);
    if (result.ok) {
      toast.success(initialData ? t("updated") : t("created"));
      router.push("/admin/blog");
      router.refresh();
    } else {
      toast.error(result.error);
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
          htmlFor="post-title"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("titleLabel")}
        </label>
        <Input
          id="post-title"
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
          htmlFor="post-excerpt"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("excerpt")}
        </label>
        <Textarea
          id="post-excerpt"
          rows={2}
          placeholder={t("excerptPlaceholder")}
          className="rounded-none border-stone-900"
          {...register("excerpt")}
        />
        {errors.excerpt && (
          <p className="font-mono text-xs text-red-600">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="post-content"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("content")}
        </label>
        <Textarea
          id="post-content"
          rows={14}
          placeholder={t("contentPlaceholder")}
          className="rounded-none border-stone-900 font-mono text-sm"
          {...register("content")}
        />
        <p className="font-mono text-[11px] text-stone-400">{t("contentHint")}</p>
        {errors.content && (
          <p className="font-mono text-xs text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900">
          {t("cover")}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-none border border-stone-900 bg-stone-50">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-stone-400" />
            )}
          </div>
          <label
            htmlFor="post-cover"
            className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
          >
            <Upload className="h-4 w-4" />
            {t("chooseImage")}
          </label>
          <input
            id="post-cover"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleCoverChange(file);
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
            {...register("published")}
          />
          <span className="font-mono text-sm text-stone-700">{t("publishedToggle")}</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
        >
          {isSubmitting ? (
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
          onClick={() => router.push("/admin/blog")}
          className="rounded-none border-stone-900 font-mono text-sm uppercase tracking-widest"
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
