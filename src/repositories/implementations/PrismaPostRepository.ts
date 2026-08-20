import { prisma } from "@/lib/db";
import type {
  IPostRepository,
  PostData,
  PostInput,
} from "../interfaces/IPostRepository";

export class PrismaPostRepository implements IPostRepository {
  async findAll(publishedOnly = false): Promise<PostData[]> {
    try {
      return await prisma.post.findMany({
        where: publishedOnly ? { published: true } : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      return [];
    }
  }

  async findById(id: string): Promise<PostData | null> {
    try {
      return await prisma.post.findUnique({ where: { id } });
    } catch (error) {
      console.error(`Failed to fetch post by id "${id}":`, error);
      return null;
    }
  }

  async findBySlug(slug: string): Promise<PostData | null> {
    try {
      return await prisma.post.findUnique({ where: { slug } });
    } catch (error) {
      console.error(`Failed to fetch post by slug "${slug}":`, error);
      return null;
    }
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
