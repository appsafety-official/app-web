import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { leadMagnetRepository } from "@/repositories/implementations/PrismaLeadMagnetRepository";
import { LeadMagnetForm } from "@/components/admin/LeadMagnetForm";

export default async function AdminEditLeadMagnetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.leadMagnets");
  const leadMagnet = await leadMagnetRepository.findById(id);

  if (!leadMagnet) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/lead-magnets"
          className="flex items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
          {t("editFreebie")}
        </h1>
      </div>
      <LeadMagnetForm initialData={leadMagnet} />
    </div>
  );
}
