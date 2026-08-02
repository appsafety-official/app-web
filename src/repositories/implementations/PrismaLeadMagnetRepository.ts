import { prisma } from "@/lib/db";
import type {
  ILeadMagnetRepository,
  LeadMagnetData,
  LeadMagnetInput,
} from "../interfaces/ILeadMagnetRepository";

export class PrismaLeadMagnetRepository implements ILeadMagnetRepository {
  findAll(): Promise<LeadMagnetData[]> {
    return prisma.leadMagnet.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  getActive(): Promise<LeadMagnetData | null> {
    return prisma.leadMagnet.findFirst({
      where: { isActive: true },
    });
  }

  findById(id: string): Promise<LeadMagnetData | null> {
    return prisma.leadMagnet.findUnique({ where: { id } });
  }

  async create(data: LeadMagnetInput): Promise<LeadMagnetData> {
    return prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.leadMagnet.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }
      return tx.leadMagnet.create({ data });
    });
  }

  async update(
    id: string,
    data: Partial<LeadMagnetInput>,
  ): Promise<LeadMagnetData> {
    return prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.leadMagnet.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }
      return tx.leadMagnet.update({ where: { id }, data });
    });
  }

  delete(id: string): Promise<void> {
    return prisma.leadMagnet.delete({ where: { id } }).then(() => undefined);
  }
}

export const leadMagnetRepository = new PrismaLeadMagnetRepository();
