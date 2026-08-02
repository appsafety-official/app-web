"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { orderRepository } from "@/repositories/implementations/PrismaOrderRepository";
import type { OrderFilters } from "@/repositories/interfaces/IOrderRepository";

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

export async function getAllOrders(
  filters: OrderFilters = {},
): Promise<ActionResult<Awaited<ReturnType<typeof orderRepository.findAll>>>> {
  try {
    await requireAdmin();
    const data = await orderRepository.findAll(filters);
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

export async function getOrderById(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof orderRepository.findById>>>> {
  try {
    await requireAdmin();
    const data = await orderRepository.findById(id);
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

export async function updateOrderStatus(
  id: string,
  status: string,
  notes?: string,
): Promise<ActionResult<Awaited<ReturnType<typeof orderRepository.updateStatus>>>> {
  try {
    await requireAdmin();
    const parsed = updateStatusSchema.parse({ id, status, notes });
    const data = await orderRepository.updateStatus(
      parsed.id,
      parsed.status,
      parsed.notes ?? undefined,
    );
    revalidatePath("/admin/orders");
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}

export async function getOrderSummary(): Promise<
  ActionResult<Awaited<ReturnType<typeof orderRepository.getSummary>>>
> {
  try {
    await requireAdmin();
    const data = await orderRepository.getSummary();
    return { ok: true, data };
  } catch (error) {
    return toError(error);
  }
}
