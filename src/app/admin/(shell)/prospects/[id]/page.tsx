import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";
import { UpdateProspectStatusForm } from "@/components/admin/UpdateProspectStatusForm";

const statusStyles: Record<string, string> = {
  cold: "bg-stone-300 text-stone-900",
  warm: "bg-yellow-500 text-stone-900",
  hot: "bg-red-500 text-white",
};

type OrderItem = {
  productName?: string;
  name?: string;
  qty?: number;
  quantity?: number;
  price?: number;
  subtotal?: number;
};

export default async function AdminProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.prospects");
  const prospect = await prospectRepository.findById(id);

  if (!prospect) {
    notFound();
  }

  const orderItems = Array.isArray(prospect.orderItems)
    ? (prospect.orderItems as OrderItem[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/prospects"
          className="flex items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
            {prospect.name}
          </h1>
          <div className="mt-1">
            <Badge
              className={cn(
                "rounded-none font-mono text-[11px] font-bold uppercase tracking-wider",
                statusStyles[prospect.status] ?? "bg-stone-300 text-stone-900",
              )}
            >
              {t(`status.${prospect.status}`)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-none border border-stone-900 bg-white p-5">
            <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-stone-900">
              {t("customerInfo")}
            </h2>
            <dl className="grid grid-cols-1 gap-4 font-mono text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("whatsapp")}
                </dt>
                <dd className="mt-1 text-stone-900">{prospect.whatsapp}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("sourceColumn")}
                </dt>
                <dd className="mt-1 text-stone-900">
                  {prospect.acquisitionChannel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("address")}
                </dt>
                <dd className="mt-1 text-stone-900">
                  {prospect.address ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("tokopediaOrderId")}
                </dt>
                <dd className="mt-1 text-stone-900">
                  {prospect.tokopediaOrderId ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("created")}
                </dt>
                <dd className="mt-1 text-stone-900">
                  {format(new Date(prospect.createdAt), "dd MMM yyyy, HH:mm")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("totalAmount")}
                </dt>
                <dd className="mt-1 font-bold text-stone-900">
                  Rp {prospect.totalAmount.toLocaleString("id-ID")}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t("notesLabel")}
                </dt>
                <dd className="mt-1 text-stone-900">{prospect.notesAdmin ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-x-auto rounded-none border border-stone-900 bg-white">
            <div className="border-b border-stone-900 p-5">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-900">
                {t("orderItems")}
              </h2>
            </div>
            {orderItems.length === 0 ? (
              <p className="p-5 font-mono text-sm text-stone-500">
                {t("noOrderItems")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-100 font-mono text-xs uppercase tracking-wider text-stone-500">
                    <TableHead>{t("product")}</TableHead>
                    <TableHead className="text-center">{t("qty")}</TableHead>
                    <TableHead className="text-right">{t("price")}</TableHead>
                    <TableHead className="text-right">{t("subtotal")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => {
                    const qty = item.qty ?? item.quantity ?? 0;
                    const price = item.price ?? 0;
                    const subtotal = item.subtotal ?? qty * price;
                    return (
                      <TableRow key={index} className="font-mono">
                        <TableCell className="font-bold text-stone-900">
                          {item.productName ?? item.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-stone-600">
                          {qty}
                        </TableCell>
                        <TableCell className="text-right text-stone-600">
                          Rp {price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right text-stone-900">
                          Rp {subtotal.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <UpdateProspectStatusForm
            prospectId={prospect.id}
            initialStatus={prospect.status}
            initialNotes={prospect.notesAdmin}
          />
        </aside>
      </div>
    </div>
  );
}
