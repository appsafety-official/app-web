import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { IStorageService } from "./interfaces/IStorageService";

export const PRODUCT_IMAGE_BUCKET = "product-images";

export function getStoragePathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf(PRODUCT_IMAGE_BUCKET);
    if (bucketIndex === -1 || bucketIndex === segments.length - 1) {
      return null;
    }
    return segments.slice(bucketIndex + 1).join("/");
  } catch {
    return null;
  }
}

export class SupabaseStorageService implements IStorageService {
  private requireClient() {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }
    return supabase;
  }

  async upload(file: File, path: string): Promise<string> {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }
    const client = this.requireClient();
    const { error } = await client.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return this.getUrl(path);
  }

  getUrl(path: string): Promise<string> {
    const client = this.requireClient();
    return Promise.resolve(
      client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data
        .publicUrl,
    );
  }

  async delete(path: string): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove([path]);
    if (error) throw error;
  }
}

export const storageService = new SupabaseStorageService();
