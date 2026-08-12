import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/actions/postActions";
import { MarkdownContent } from "@/components/public/MarkdownContent";

function stripLeadingH1(markdown: string): string {
  return markdown.replace(/^#\s+.+\n?/, "");
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("blog");
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/blog"
        className="mb-8 flex items-center gap-2 text-xs font-medium text-stone-600 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToBlog")}
      </Link>

      <p className="font-mono text-[10px] font-semibold tracking-widest text-stone-500">
        {format(new Date(post.createdAt), "dd MMM yyyy")}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
        {post.title}
      </h1>

      {post.coverUrl && (
        <div className="mt-8 flex items-center justify-center overflow-hidden rounded-none border border-stone-900 bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverUrl} alt={post.title} className="w-full" />
        </div>
      )}

      {post.excerpt && (
        <p className="mt-8 border-l-4 border-stone-900 pl-4 font-mono text-sm leading-relaxed text-stone-600">
          {post.excerpt}
        </p>
      )}

      <div className="mt-8 border-t border-stone-200 pt-6">
        <MarkdownContent content={stripLeadingH1(post.content)} />
      </div>
    </article>
  );
}
