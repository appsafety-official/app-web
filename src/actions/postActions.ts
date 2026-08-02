"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { postRepository } from "@/repositories/implementations/PrismaPostRepository";
import type { PostData } from "@/repositories/interfaces/IPostRepository";
import {
  BLOG_IMAGE_BUCKET,
  storageService,
} from "@/repositories/storage.service";

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureUniqueSlug(
  slug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = slug;
  let counter = 2;
  for (;;) {
    const existing = await postRepository.findBySlug(candidate);
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    candidate = `${slug}-${counter}`;
    counter += 1;
  }
}

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().min(1, "Content is required"),
  published: z.boolean().optional().default(false),
  coverUrl: z.string().optional().or(z.literal("")),
});

type PostInput = z.infer<typeof postSchema>;

export async function getAllPosts(publishedOnly = false): Promise<PostData[]> {
  if (!publishedOnly) {
    await requireAdmin();
  }
  return postRepository.findAll(publishedOnly);
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const post = await postRepository.findBySlug(slug);
  return post && post.published ? post : null;
}

async function resolveCover(
  input: PostInput,
  coverFile?: File | null,
): Promise<{ coverUrl: string | null; uploadedPath?: string }> {
  if (coverFile && coverFile.size > 0) {
    const coverUrl = await storageService.upload(coverFile, BLOG_IMAGE_BUCKET);
    return { coverUrl, uploadedPath: coverUrl };
  }
  return { coverUrl: input.coverUrl || null };
}

export async function createPost(
  input: unknown,
  coverFile?: File | null,
): Promise<ActionResult<PostData>> {
  try {
    await requireAdmin();
    const parsed = postSchema.parse(input);
    const slug = await ensureUniqueSlug(slugify(parsed.title));
    const { coverUrl } = await resolveCover(parsed, coverFile);
    const post = await postRepository.create({
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      coverUrl,
      published: parsed.published,
    });
    revalidatePath("/admin/blog");
    revalidatePath("/[locale]/blog", "page");
    return { ok: true, data: post };
  } catch (error) {
    return toError(error);
  }
}

export async function updatePost(
  id: string,
  input: unknown,
  coverFile?: File | null,
): Promise<ActionResult<PostData>> {
  try {
    await requireAdmin();
    const existing = await postRepository.findById(id);
    if (!existing) throw new Error("Post not found");
    const parsed = postSchema.parse(input);
    const slug = await ensureUniqueSlug(slugify(parsed.title), id);
    const { coverUrl, uploadedPath } = await resolveCover(parsed, coverFile);

    if (uploadedPath && existing.coverUrl) {
      try {
        await storageService.delete(existing.coverUrl, BLOG_IMAGE_BUCKET);
      } catch {
        // best-effort cleanup
      }
    }

    const post = await postRepository.update(id, {
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      coverUrl,
      published: parsed.published,
    });
    revalidatePath("/admin/blog");
    revalidatePath("/[locale]/blog", "page");
    return { ok: true, data: post };
  } catch (error) {
    return toError(error);
  }
}

export async function deletePost(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const existing = await postRepository.findById(id);
    if (existing?.coverUrl) {
      try {
        await storageService.delete(existing.coverUrl, BLOG_IMAGE_BUCKET);
      } catch {
        // best-effort cleanup
      }
    }
    await postRepository.delete(id);
    revalidatePath("/admin/blog");
    revalidatePath("/[locale]/blog", "page");
    return { ok: true, data: { id } };
  } catch (error) {
    return toError(error);
  }
}
