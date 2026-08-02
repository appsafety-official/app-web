import { prisma } from "@/lib/db";
import type {
  IPostRepository,
  PostData,
  PostInput,
} from "../interfaces/IPostRepository";

export class PrismaPostRepository implements IPostRepository {
  findAll(publishedOnly = false): Promise<PostData[]> {
    return prisma.post.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<PostData | null> {
    return prisma.post.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<PostData | null> {
    return prisma.post.findUnique({ where: { slug } });
  }

  create(data: PostInput): Promise<PostData> {
    return prisma.post.create({ data });
  }

  update(id: string, data: Partial<PostInput>): Promise<PostData> {
    return prisma.post.update({ where: { id }, data });
  }

  delete(id: string): Promise<void> {
    return prisma.post.delete({ where: { id } }).then(() => undefined);
  }
}

export const postRepository = new PrismaPostRepository();
