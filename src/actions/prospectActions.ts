"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";
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
