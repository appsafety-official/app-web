import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { IStorageService } from "./interfaces/IStorageService";

export const PRODUCT_IMAGE_BUCKET = "product-images";
export const BLOG_IMAGE_BUCKET = "blog-images";
export const LEAD_MAGNET_BUCKET = "lead-magnets";

function getFileNameFromUrl(fileUrl: string): string | null {
  try {
    const pathname = new URL(fileUrl).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const fileName = segments[segments.length - 1];
    return fileName || null;
  } catch {
    return null;
  }
}

export class SupabaseStorageService implements IStorageService {
  private getClient() {
    const client = getSupabaseAdmin();
    if (!client) {
      throw new Error(
        "Supabase Admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    return client;
  }

  async upload(file: File, bucket: string): Promise<string> {
    const client = this.getClient();
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await client.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = client.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async delete(fileUrl: string, bucket: string): Promise<void> {
    const client = this.getClient();
    const fileName = getFileNameFromUrl(fileUrl);
    if (!fileName) {
      throw new Error("Invalid file URL");
    }
    const { error } = await client.storage.from(bucket).remove([fileName]);
    if (error) throw error;
  }
}

export const storageService = new SupabaseStorageService();
