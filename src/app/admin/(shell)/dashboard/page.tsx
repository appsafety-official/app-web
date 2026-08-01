import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { StatsCards } from "@/components/admin/StatsCards";
import { RecentProspectsTable } from "@/components/admin/RecentProspectsTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalProducts, totalProspects, totalOrders, revenueAgg, recentProspects] =
    await Promise.all([
      prisma.product.count(),
      prisma.prospect.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "paid" },
      }),
      prisma.prospect.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const t = await getTranslations("admin.dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-1 font-mono text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <StatsCards
        products={totalProducts}
        prospects={totalProspects}
        orders={totalOrders}
        revenue={revenueAgg._sum.totalAmount ?? 0}
      />

      <RecentProspectsTable prospects={recentProspects} />
    </div>
  );
}
