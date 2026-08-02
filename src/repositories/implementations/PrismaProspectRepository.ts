import Papa from "papaparse";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type {
  IProspectRepository,
  ProspectData,
  ProspectFilters,
  ProspectInput,
} from "../interfaces/IProspectRepository";

export class PrismaProspectRepository implements IProspectRepository {
  findAll(filters?: ProspectFilters): Promise<ProspectData[]> {
    const where: Prisma.ProspectWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.source) {
      where.acquisitionChannel = filters.source;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { whatsapp: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.prospect.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<ProspectData | null> {
    return prisma.prospect.findUnique({ where: { id } });
  }

  create(data: ProspectInput): Promise<ProspectData> {
    return prisma.prospect.create({
      data: {
        ...data,
        orderItems: (data.orderItems ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  update(id: string, data: Partial<ProspectInput>): Promise<ProspectData> {
    return prisma.prospect.update({
      where: { id },
      data: {
        ...data,
        orderItems:
          data.orderItems === undefined
            ? undefined
            : (data.orderItems as Prisma.InputJsonValue),
      },
    });
  }

  updateStatus(
    id: string,
    status: string,
    notes?: string,
  ): Promise<ProspectData> {
    return prisma.prospect.update({
      where: { id },
      data: {
        status,
        notesAdmin: notes,
      },
    });
  }

  delete(id: string): Promise<void> {
    return prisma.prospect.delete({ where: { id } }).then(() => undefined);
  }

  async exportToCSV(): Promise<string> {
    const prospects = await prisma.prospect.findMany({
      orderBy: { createdAt: "desc" },
    });

    const rows = prospects.map((prospect) => ({
      Name: prospect.name,
      WhatsApp: prospect.whatsapp,
      Address: prospect.address ?? "",
      "Tokopedia Order ID": prospect.tokopediaOrderId ?? "",
      Source: prospect.acquisitionChannel,
      Status: prospect.status,
      "Total Amount": prospect.totalAmount,
      "Notes Admin": prospect.notesAdmin ?? "",
      "Created At": prospect.createdAt.toISOString(),
    }));

    // BOM agar karakter UTF-8 (mis. nama Indonesia) terbuka benar di Excel
    return `\uFEFF${Papa.unparse(rows)}`;
  }
}

export const prospectRepository = new PrismaProspectRepository();
