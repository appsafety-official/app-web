import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type {
  IOrderRepository,
  OrderData,
  OrderFilters,
  OrderInput,
  OrderSummary,
} from "../interfaces/IOrderRepository";

export class PrismaOrderRepository implements IOrderRepository {
  findAll(filters?: OrderFilters): Promise<OrderData[]> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<OrderData | null> {
    return prisma.order.findUnique({ where: { id } });
  }

  create(data: OrderInput): Promise<OrderData> {
    return prisma.order.create({
      data: {
        ...data,
        items: (data.items ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  updateStatus(
    id: string,
    status: string,
    notes?: string,
  ): Promise<OrderData> {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes ?? undefined,
      },
    });
  }

  async getSummary(): Promise<OrderSummary> {
    const [total, paid, grouped] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: "paid" },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const countOf = (status: string) =>
      grouped.find((group) => group.status === status)?._count._all ?? 0;

    return {
      total,
      paidTotal: paid._sum.totalAmount ?? 0,
      pendingCount: countOf("pending_payment"),
      shippedCount: countOf("shipped"),
      cancelledCount: countOf("cancelled"),
    };
  }
}

export const orderRepository = new PrismaOrderRepository();
