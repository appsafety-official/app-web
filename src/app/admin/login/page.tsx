"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { HardHat } from "lucide-react";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const router = useRouter();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.email({ error: t("emailInvalid") }).trim().toLowerCase(),
        password: z.string().min(6, { error: t("passwordMin") }),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("invalidCredentials"));
        return;
      }

      toast.success(t("success"));
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-md rounded-none border border-stone-900 bg-white p-8">
        <div className="mb-8 border-b border-stone-900 pb-6">
          <h1 className="flex items-center gap-2 font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
            <HardHat className="h-5 w-5 text-yellow-500" />
            {t("title")}
          </h1>
          <p className="mt-2 font-mono text-xs text-stone-500">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:border-yellow-500 focus:outline-none"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 font-mono text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("passwordPlaceholder")}
              className="w-full rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:border-yellow-500 focus:outline-none"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 font-mono text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-none border border-stone-900 bg-stone-900 px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 transition-colors hover:bg-yellow-500 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("loading") : t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
