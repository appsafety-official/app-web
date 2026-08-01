import { getTranslations } from "next-intl/server";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export async function StatsCards({
  products,
  prospects,
  orders,
  revenue,
}: {
  products: number;
  prospects: number;
  orders: number;
  revenue: number;
}) {
  const t = await getTranslations("admin.dashboard");

  const cards = [
    { label: t("totalProducts"), value: products.toLocaleString("id-ID"), icon: Package },
    { label: t("totalProspects"), value: prospects.toLocaleString("id-ID"), icon: Users },
    { label: t("totalOrders"), value: orders.toLocaleString("id-ID"), icon: ShoppingCart },
    { label: t("revenue"), value: `Rp ${revenue.toLocaleString("id-ID")}`, icon: TrendingUp },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-none border border-stone-900 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-500">
              {card.label}
            </p>
            <card.icon className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-stone-900">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
