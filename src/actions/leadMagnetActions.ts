"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { leadMagnetRepository } from "@/repositories/implementations/PrismaLeadMagnetRepository";
import type { LeadMagnetData } from "@/repositories/interfaces/ILeadMagnetRepository";
import {
  LEAD_MAGNET_BUCKET,
  storageService,
} from "@/repositories/storage.service";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function toError(error: unknown): { ok: false; error: string } {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Unexpected error",
  };
}

const leadMagnetSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(false),
});

export async function getActiveLeadMagnet(): Promise<LeadMagnetData | null> {
  return leadMagnetRepository.getActive();
}

export async function getAllLeadMagnets(): Promise<ActionResult<LeadMagnetData[]>> {
  try {
    await requireAdmin();
    const data = await leadMagnetRepository.findAll();
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

export async function createLeadMagnet(
  input: unknown,
  pdfFile?: File | null,
): Promise<ActionResult<LeadMagnetData>> {
  try {
    await requireAdmin();
    const parsed = leadMagnetSchema.parse(input);
    if (!pdfFile || pdfFile.size === 0) {
      return { ok: false, error: "PDF file is required" };
    }
    if (pdfFile.type !== "application/pdf" && !pdfFile.name.endsWith(".pdf")) {
      return { ok: false, error: "Only PDF files are allowed" };
    }
    const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const pdfUrl = await storageService.upload(
      new File([pdfFile], safeName, { type: "application/pdf" }),
      LEAD_MAGNET_BUCKET,
    );
    const leadMagnet = await leadMagnetRepository.create({
      title: parsed.title,
      description: parsed.description || null,
      pdfUrl,
      isActive: parsed.isActive,
    });
    revalidatePath("/admin/lead-magnets");
    revalidatePath("/[locale]");
    revalidatePath("/[locale]/blog", "page");
    return { ok: true, data: leadMagnet };
  } catch (error) {
    return toError(error);
  }
}

export async function updateLeadMagnet(
  id: string,
  input: unknown,
  pdfFile?: File | null,
): Promise<ActionResult<LeadMagnetData>> {
  try {
    await requireAdmin();
    const existing = await leadMagnetRepository.findById(id);
    if (!existing) throw new Error("Lead magnet not found");
    const parsed = leadMagnetSchema.parse(input);

    let pdfUrl = parsed.pdfUrl || existing.pdfUrl;
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.type !== "application/pdf" && !pdfFile.name.endsWith(".pdf")) {
        return { ok: false, error: "Only PDF files are allowed" };
      }
      const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      pdfUrl = await storageService.upload(
        new File([pdfFile], safeName, { type: "application/pdf" }),
        LEAD_MAGNET_BUCKET,
      );
      try {
        await storageService.delete(existing.pdfUrl, LEAD_MAGNET_BUCKET);
      } catch {
        // best-effort cleanup
      }
    }

    const leadMagnet = await leadMagnetRepository.update(id, {
      title: parsed.title,
      description: parsed.description || null,
      pdfUrl,
      isActive: parsed.isActive,
    });
    revalidatePath("/admin/lead-magnets");
    revalidatePath("/[locale]");
    revalidatePath("/[locale]/blog", "page");
    return { ok: true, data: leadMagnet };
  } catch (error) {
    return toError(error);
  }
}

export async function deleteLeadMagnet(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const existing = await leadMagnetRepository.findById(id);
    if (existing) {
      try {
        await storageService.delete(existing.pdfUrl, LEAD_MAGNET_BUCKET);
      } catch {
        // best-effort cleanup
      }
    }
    await leadMagnetRepository.delete(id);
    revalidatePath("/admin/lead-magnets");
    revalidatePath("/[locale]");
    revalidatePath("/[locale]/blog", "page");
    return { ok: true, data: { id } };
  } catch (error) {
    return toError(error);
  }
}
