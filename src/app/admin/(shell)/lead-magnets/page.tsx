import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { FileText, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllLeadMagnets } from "@/actions/leadMagnetActions";
import { DeleteLeadMagnetButton } from "@/components/admin/DeleteLeadMagnetButton";

export const dynamic = "force-dynamic";

export default async function AdminLeadMagnetsPage() {
  const t = await getTranslations("admin.leadMagnets");
  const result = await getAllLeadMagnets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
            {t("title")}
          </h1>
          <p className="mt-1 font-mono text-sm text-stone-500">{t("subtitle")}</p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/lead-magnets/new" />}
          className="rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
        >
          <Plus />
          {t("addFreebie")}
        </Button>
      </div>

      {!result.ok ? (
        <p className="rounded-none border border-stone-900 bg-white p-6 font-mono text-sm text-red-600">
          {result.error}
        </p>
      ) : result.data.length === 0 ? (
        <p className="rounded-none border border-stone-900 bg-white p-6 font-mono text-sm text-stone-500">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-none border border-stone-900 bg-white">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-stone-900 bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3">{t("titleColumn")}</th>
                <th className="px-4 py-3">{t("pdfColumn")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("date")}</th>
                <th className="px-4 py-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((leadMagnet) => (
                <tr
                  key={leadMagnet.id}
                  className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-stone-900 bg-stone-50">
                        <FileText className="h-4 w-4 text-stone-500" />
                      </div>
                      <span className="font-bold text-stone-900">
                        {leadMagnet.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {leadMagnet.pdfUrl.split("/").pop()}
                  </td>
                  <td className="px-4 py-3">
                    {leadMagnet.isActive ? (
                      <Badge className="rounded-none bg-green-200 text-green-900">
                        {t("active")}
                      </Badge>
                    ) : (
                      <Badge className="rounded-none bg-stone-300 text-stone-900">
                        {t("inactive")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {format(new Date(leadMagnet.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={
                          <Link href={`/admin/lead-magnets/${leadMagnet.id}/edit`} />
                        }
                      >
                        <Pencil />
                        <span className="sr-only">{t("edit")}</span>
                      </Button>
                      <DeleteLeadMagnetButton leadMagnetId={leadMagnet.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
