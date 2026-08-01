import Link from "next/link";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import type { Prospect } from "@/generated/prisma/client";

const statusStyles: Record<string, string> = {
  cold: "bg-stone-300 text-stone-900",
  warm: "bg-yellow-500 text-stone-900",
  hot: "bg-red-500 text-white",
};

const statusLabelKeys: Record<string, string> = {
  cold: "statusCold",
  warm: "statusWarm",
  hot: "statusHot",
};

export async function RecentProspectsTable({
  prospects,
}: {
  prospects: Prospect[];
}) {
  const t = await getTranslations("admin.dashboard");

  return (
    <div className="rounded-none border border-stone-900 bg-white">
      <div className="border-b border-stone-900 p-4">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-900">
          {t("recentProspects")}
        </h2>
      </div>

      {prospects.length === 0 ? (
        <p className="p-4 font-mono text-sm text-stone-500">{t("noData")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-stone-900 bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3">{t("name")}</th>
                <th className="px-4 py-3">{t("whatsapp")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("source")}</th>
                <th className="px-4 py-3">{t("date")}</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((prospect) => {
                const status = prospect.status;
                return (
                  <tr
                    key={prospect.id}
                    className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/prospects/${prospect.id}`}
                        className="font-bold text-stone-900 hover:text-yellow-600"
                      >
                        {prospect.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {prospect.whatsapp}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          statusStyles[status] ?? "bg-stone-300 text-stone-900"
                        }`}
                      >
                        {t(statusLabelKeys[status] ?? "statusCold")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {prospect.acquisitionChannel}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {format(new Date(prospect.createdAt), "dd MMM yyyy")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
