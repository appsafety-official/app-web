"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProspectStatus } from "@/actions/prospectActions";

const prospectStatuses = ["cold", "warm", "hot"] as const;

export function UpdateProspectStatusForm({
  prospectId,
  initialStatus,
  initialNotes,
}: {
  prospectId: string;
  initialStatus: string;
  initialNotes: string | null;
}) {
  const t = useTranslations("admin.prospects");
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await updateProspectStatus(prospectId, status, notes);
    setPending(false);
    if (result.ok) {
      toast.success(t("statusUpdated"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-none border border-stone-900 bg-white p-5"
    >
      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-900">
        {t("updateStatus")}
      </h2>

      <div className="space-y-2">
        <label
          htmlFor="prospect-status"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("statusLabel")}
        </label>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "cold")}>
          <SelectTrigger
            id="prospect-status"
            className="w-full rounded-none border-stone-900"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {prospectStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`status.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="prospect-notes"
          className="block font-mono text-xs font-semibold uppercase tracking-wider text-stone-900"
        >
          {t("notesLabel")}
        </label>
        <Textarea
          id="prospect-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t("notesPlaceholder")}
          className="rounded-none border-stone-900"
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-none border border-stone-900 bg-stone-900 font-mono text-sm font-bold uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-stone-900"
      >
        {pending ? t("saving") : t("saveStatus")}
      </Button>
    </form>
  );
}
