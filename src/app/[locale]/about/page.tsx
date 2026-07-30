import { getTranslations } from "next-intl/server";
import { Building2, Award, Users } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const st = await getTranslations({ locale, namespace: "about.stats" });

  const stats = [
    { icon: Building2, title: "500+", desc: st("clients") },
    { icon: Award, title: "ISO 9001", desc: st("certified") },
    { icon: Users, title: "40+", desc: st("engineers") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <section>
        <p className="mb-4 font-mono text-xs font-semibold tracking-widest text-gray-400">
          {t("overline")}
        </p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          {t("description")}
        </p>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.title} className="border border-gray-200 bg-white px-8 py-10">
              <s.icon className="mb-6 h-6 w-6 text-orange" strokeWidth={1.5} />
              <p className="font-mono text-4xl font-bold text-black">{s.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="mt-20 border-gray-200" />
      <section className="mt-16 grid gap-12 sm:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-gray-400">
            {t("mission.overline")}
          </p>
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            {t("mission.title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            {t("mission.description")}
          </p>
        </div>
        <div>
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-gray-400">
            {t("approach.overline")}
          </p>
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            {t("approach.title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            {t("approach.description")}
          </p>
        </div>
      </section>
    </div>
  );
}
