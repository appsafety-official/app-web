import Link from "next/link";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { ImageIcon } from "lucide-react";
import { getAllPosts } from "@/actions/postActions";
import { getActiveLeadMagnet } from "@/actions/leadMagnetActions";
import { LeadMagnetWidget } from "@/components/public/LeadMagnetWidget";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const posts = await getAllPosts(true);
  const activeLeadMagnet = await getActiveLeadMagnet();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="mb-6 font-mono text-xs tracking-wider text-stone-400">
        {t("breadcrumb")}
      </p>

      <div>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
          {t("subtitle")}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 border border-stone-900 bg-white p-6 font-mono text-sm text-stone-500">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-none border border-stone-900 bg-white transition-colors hover:bg-yellow-500"
            >
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-stone-900 bg-stone-100">
                {post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-stone-400" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="font-mono text-[10px] font-semibold tracking-widest text-stone-500">
                  {format(new Date(post.createdAt), "dd MMM yyyy")}
                </p>
                <h2 className="font-mono text-base font-bold leading-snug text-stone-900">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeLeadMagnet && (
        <div className="mt-12 flex justify-center">
          <LeadMagnetWidget leadMagnet={activeLeadMagnet} />
        </div>
      )}
    </div>
  );
}
