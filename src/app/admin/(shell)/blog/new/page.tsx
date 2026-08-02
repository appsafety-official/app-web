import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function AdminNewBlogPostPage() {
  const t = await getTranslations("admin.blog");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 rounded-none border border-stone-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-stone-900 transition-colors hover:bg-yellow-500"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-stone-900">
          {t("newPost")}
        </h1>
      </div>
      <BlogForm />
    </div>
  );
}
