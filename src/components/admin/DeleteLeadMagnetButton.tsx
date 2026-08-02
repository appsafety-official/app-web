"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteLeadMagnet } from "@/actions/leadMagnetActions";

export function DeleteLeadMagnetButton({ leadMagnetId }: { leadMagnetId: string }) {
  const t = useTranslations("admin.leadMagnets");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deleteLeadMagnet(leadMagnetId);
    setPending(false);
    if (result.ok) {
      setOpen(false);
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Trash2 className="text-red-600" />
          </Button>
        }
      />
      <DialogContent className="rounded-none border-stone-900">
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription>{t("deleteConfirm")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-none border-stone-900"
            onClick={() => setOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-none"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
