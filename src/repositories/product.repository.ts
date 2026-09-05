import { prisma } from "@/lib/db";
import { normalizeSpecs } from "@/lib/product-specs";
import type { Prisma } from "@/generated/prisma/client";
import type {
  IProductRepository,
  ProductData,
  ProductInput,
} from "./interfaces/IProductRepository";

export class ProductRepository implements IProductRepository {
  private toData(row: Omit<ProductData, "specs"> & { specs: unknown }): ProductData {
    return { ...row, specs: normalizeSpecs(row.specs) };
  }

  async findAll(): Promise<ProductData[]> {
    const rows = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((row) => this.toData(row as Omit<ProductData, "specs"> & { specs: unknown }));
  }

  async findById(id: string): Promise<ProductData | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? this.toData(row as Omit<ProductData, "specs"> & { specs: unknown }) : null;
  }

  async findByCategory(category: string): Promise<ProductData[]> {
    const rows = await prisma.product.findMany({
      where: { category },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((row) => this.toData(row as Omit<ProductData, "specs"> & { specs: unknown }));
  }

  async create(data: ProductInput): Promise<ProductData> {
    // New products always appear at the top of the list (sortOrder 0).
    const row = await prisma.product.create({
      data: {
        ...data,
        sortOrder: 0,
        specs: data.specs as Prisma.InputJsonValue | undefined,
      },
    });
    return this.toData(row as Omit<ProductData, "specs"> & { specs: unknown });
  }

  async update(id: string, data: Partial<ProductInput>): Promise<ProductData> {
    const row = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        specs: data.specs as Prisma.InputJsonValue | undefined,
      },
    });
    return this.toData(row as Omit<ProductData, "specs"> & { specs: unknown });
  }

  delete(id: string): Promise<void> {
    return prisma.product.delete({ where: { id } }).then(() => undefined);
  }

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
  }
}

export const productRepository = new ProductRepository();
