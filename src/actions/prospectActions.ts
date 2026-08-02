"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";
import { leadMagnetRepository } from "@/repositories/implementations/PrismaLeadMagnetRepository";
import type { ProspectFilters } from "@/repositories/interfaces/IProspectRepository";

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

export async function getAllProspects(
  filters: ProspectFilters = {},
): Promise<ActionResult<Awaited<ReturnType<typeof prospectRepository.findAll>>>> {
  try {
    await requireAdmin();
    const data = await prospectRepository.findAll(filters);
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

export async function getProspectById(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof prospectRepository.findById>>>> {
  try {
    await requireAdmin();
    const data = await prospectRepository.findById(id);
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export async function updateProspectStatus(
  id: string,
  status: string,
  notes?: string,
): Promise<ActionResult<Awaited<ReturnType<typeof prospectRepository.updateStatus>>>> {
  try {
    await requireAdmin();
    const parsed = updateStatusSchema.parse({ id, status, notes });
    const data = await prospectRepository.updateStatus(
      parsed.id,
      parsed.status,
      parsed.notes ?? undefined,
    );
    revalidatePath("/admin/prospects");
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

export async function exportProspectsToCSV(): Promise<ActionResult<string>> {
  try {
    await requireAdmin();
    const data = await prospectRepository.exportToCSV();
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

const captureSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp number must be at least 10 digits")
    .regex(/^[0-9+\s()-]+$/, "Invalid WhatsApp number"),
  leadMagnetId: z.string().min(1),
});

export async function captureLeadMagnetDownload(data: {
  name: string;
  whatsapp: string;
  leadMagnetId: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = captureSchema.parse(data);
    const leadMagnet = await leadMagnetRepository.findById(parsed.leadMagnetId);
    if (!leadMagnet) {
      return { ok: false, error: "Lead magnet not found" };
    }
    const prospect = await prospectRepository.create({
      name: parsed.name,
      whatsapp: parsed.whatsapp,
      acquisitionChannel: "lead_magnet",
      status: "warm",
      orderItems: [],
    });
    return { ok: true, data: { id: prospect.id } };
  } catch (error) {
    return toError(error);
  }
}
