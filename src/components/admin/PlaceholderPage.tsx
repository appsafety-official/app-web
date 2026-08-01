import { getTranslations } from "next-intl/server";
import { Construction } from "lucide-react";

export async function PlaceholderPage({
  messageKey,
}: {
  messageKey: "productsSoon" | "prospectsSoon" | "ordersSoon";
}) {
  const t = await getTranslations("admin.placeholder");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Construction className="mx-auto h-10 w-10 text-yellow-500" />
        <h1 className="mt-4 font-mono text-lg font-bold uppercase tracking-widest text-stone-900">
          {t("comingSoon")}
        </h1>
        <p className="mt-2 font-mono text-sm text-stone-600">{t(messageKey)}</p>
      </div>
    </div>
  );
}
