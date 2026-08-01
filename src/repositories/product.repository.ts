import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type {
  IProductRepository,
  ProductData,
  ProductInput,
} from "./interfaces/IProductRepository";

export class ProductRepository implements IProductRepository {
  findAll(): Promise<ProductData[]> {
    return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  findById(id: string): Promise<ProductData | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  findByCategory(category: string): Promise<ProductData[]> {
    return prisma.product.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: ProductInput): Promise<ProductData> {
    return prisma.product.create({
      data: {
        ...data,
        specs: data.specs as Prisma.InputJsonValue | undefined,
      },
    });
  }

  update(id: string, data: Partial<ProductInput>): Promise<ProductData> {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        specs: data.specs as Prisma.InputJsonValue | undefined,
      },
    });
  }

  delete(id: string): Promise<void> {
    return prisma.product.delete({ where: { id } }).then(() => undefined);
  }
}

export const productRepository = new ProductRepository();
