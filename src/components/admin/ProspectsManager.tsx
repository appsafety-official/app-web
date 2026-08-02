"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, Eye, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  exportProspectsToCSV,
  getAllProspects,
} from "@/actions/prospectActions";
import type { ProspectData } from "@/repositories/interfaces/IProspectRepository";

const prospectStatuses = ["cold", "warm", "hot"] as const;
const prospectSources = [
  "organic_web",
  "tokopedia_insert",
  "instagram",
  "walk_in",
] as const;

const statusStyles: Record<string, string> = {
  cold: "bg-stone-300 text-stone-900",
  warm: "bg-yellow-500 text-stone-900",
  hot: "bg-red-500 text-white",
};

const statusLabelKeys: Record<string, string> = {
  cold: "status.cold",
  warm: "status.warm",
  hot: "status.hot",
};

export function ProspectsManager({
  initialProspects,
}: {
  initialProspects: ProspectData[];
}) {
  const t = useTranslations("admin.prospects");
  const [prospects, setProspects] = useState(initialProspects);
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetch = useCallback(
    async (filters: { status?: string; source?: string; search?: string }) => {
      setLoading(true);
      const result = await getAllProspects(filters);
      setLoading(false);
      if (result.ok) {
        setProspects(result.data);
      } else {
        toast.error(result.error);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void refetch({
        status: status === "all" ? undefined : status,
        source: source === "all" ? undefined : source,
        search: search.trim() || undefined,
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [status, source, search, refetch]);

  async function handleExport() {
    setExporting(true);
    const result = await exportProspectsToCSV();
    setExporting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const blob = new Blob([result.data], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prospects-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

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
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
        >
          <Download />
          {exporting ? t("exporting") : t("exportCsv")}
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="rounded-none border-stone-900 pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-full rounded-none border-stone-900 md:w-44">
            <SelectValue placeholder={t("statusAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("statusAll")}</SelectItem>
            {prospectStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`status.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(value) => setSource(value ?? "all")}>
          <SelectTrigger className="w-full rounded-none border-stone-900 md:w-48">
            <SelectValue placeholder={t("sourceAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("sourceAll")}</SelectItem>
            {prospectSources.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`source.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-none border border-stone-900 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-100 font-mono text-xs uppercase tracking-wider text-stone-500">
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("whatsapp")}</TableHead>
              <TableHead>{t("statusColumn")}</TableHead>
              <TableHead>{t("sourceColumn")}</TableHead>
              <TableHead>{t("totalAmount")}</TableHead>
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
            ) : prospects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-stone-500">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((prospect) => (
                <TableRow
                  key={prospect.id}
                  className="font-mono hover:bg-stone-50"
                >
                  <TableCell className="font-bold text-stone-900">
                    {prospect.name}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {prospect.whatsapp}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-none font-mono text-[11px] font-bold uppercase tracking-wider",
                        statusStyles[prospect.status] ??
                          "bg-stone-300 text-stone-900",
                      )}
                    >
                      {t(statusLabelKeys[prospect.status] ?? "status.cold")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {prospect.acquisitionChannel}
                  </TableCell>
                  <TableCell className="text-stone-900">
                    Rp {prospect.totalAmount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-stone-600">
                    {format(new Date(prospect.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/admin/prospects/${prospect.id}`} />}
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
