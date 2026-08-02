"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllOrders } from "@/actions/orderActions";
import type { OrderData } from "@/repositories/interfaces/IOrderRepository";

const orderStatuses = [
  "pending_payment",
  "paid",
  "shipped",
  "cancelled",
] as const;

const statusStyles: Record<string, string> = {
  pending_payment: "bg-yellow-500 text-stone-900",
  paid: "bg-green-600 text-white",
  shipped: "bg-blue-600 text-white",
  cancelled: "bg-stone-300 text-stone-900",
};

export function OrdersManager({ initialOrders }: { initialOrders: OrderData[] }) {
  const t = useTranslations("admin.orders");
  const [orders, setOrders] = useState(initialOrders);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetch = useCallback(async (filters: { status?: string }) => {
    setLoading(true);
    const result = await getAllOrders(filters);
    setLoading(false);
    if (result.ok) {
      setOrders(result.data);
    } else {
      toast.error(result.error);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void refetch({ status: status === "all" ? undefined : status });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [status, refetch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-1 font-mono text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-full rounded-none border-stone-900 md:w-56">
            <SelectValue placeholder={t("statusAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("statusAll")}</SelectItem>
            {orderStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`status.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-none border border-stone-900 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-100 font-mono text-xs uppercase tracking-wider text-stone-500">
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("whatsapp")}</TableHead>
              <TableHead>{t("total")}</TableHead>
              <TableHead>{t("statusColumn")}</TableHead>
              <TableHead>{t("channel")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-stone-500">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-stone-500">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="font-mono hover:bg-stone-50">
                  <TableCell className="font-bold text-stone-900">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {order.whatsapp ?? "—"}
                  </TableCell>
                  <TableCell className="text-stone-900">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-none font-mono text-[11px] font-bold uppercase tracking-wider",
                        statusStyles[order.status] ??
                          "bg-stone-300 text-stone-900",
                      )}
                    >
                      {t(`status.${order.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {order.acquisitionChannel}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {format(new Date(order.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/admin/orders/${order.id}`} />}
                    >
                      <Eye />
                      <span className="sr-only">{t("view")}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
