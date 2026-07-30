import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ShieldCheck, Truck, Ruler } from "lucide-react";
import ProductCard from "@/components/public/ProductCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const ft = await getTranslations({ locale, namespace: "home.features" });
  const pt = await getTranslations({ locale, namespace: "products.products" });

  const highlightProducts = [
    { id: "dummy-1", name: pt("fireProximitySuit"), category: "FIREFIGHTING", price: 2500000 },
    { id: "dummy-2", name: pt("weldingJacket"), category: "WELDING", price: 850000 },
    { id: "dummy-3", name: pt("beekeeperSuit"), category: "HAZMAT", price: 1200000 },
  ];

  const features = [
    { icon: ShieldCheck, title: ft("qualityTitle"), desc: ft("qualityDesc") },
    { icon: Truck, title: ft("deliveryTitle"), desc: ft("deliveryDesc") },
    { icon: Ruler, title: ft("sizingTitle"), desc: ft("sizingDesc") },
  ];

  return (
    <>
      <section className="relative border-b border-gray-200" style={{
        backgroundImage:
          "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }}>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid items-center gap-12 sm:grid-cols-2">
            <div>
              <p className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-gray-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                {t("hero.badge")}
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {t("hero.title")}{" "}
                <span className="whitespace-nowrap text-yellow">{t("hero.highlight")}</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-500 sm:text-base">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="rounded-sm bg-yellow px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                >
                  {t("hero.browseProducts")} &rarr;
                </Link>
                <Link
                  href="/contact"
                  className="rounded-sm border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-50"
                >
                  {t("hero.contactUs")}
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] flex items-center justify-center bg-gray-100">
              <span className="font-mono text-sm tracking-widest text-gray-300">
                [{t("hero.imagePlaceholder")}]
              </span>
              <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-black/70 px-3 py-2">
                <span className="font-mono text-[10px] leading-tight text-gray-300">
                  {t("hero.imageRef")} <br />
                  {t("hero.imageRefDesc")}
                </span>
                <span className="rounded-sm bg-yellow px-2 py-0.5 font-mono text-[10px] font-bold text-black">
                  {t("hero.imageBadge")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl flex-col divide-y divide-gray-200 px-4 sm:flex-row sm:divide-x sm:divide-y-0">
          {[
            { stat: "10+", label: t("stats.years") },
            { stat: "500+", label: t("stats.clients") },
            { stat: "ISO", label: t("stats.certified") },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center py-10 sm:flex-1 sm:py-14"
            >
              <span className="font-mono text-4xl font-bold text-black sm:text-5xl">
                {item.stat}
              </span>
              <span className="mt-2 font-mono text-[10px] font-semibold tracking-widest text-gray-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="border border-gray-200 px-6 py-8">
                <f.icon className="mb-4 h-6 w-6 text-orange" strokeWidth={1.5} />
                <h3 className="mb-2 text-base font-bold text-black">{f.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 font-mono text-xs font-semibold tracking-widest text-gray-400">
                {t("highlightedGear.overline")}
              </p>
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                {t("highlightedGear.title")}
              </h2>
            </div>
            <Link
              href="/products"
              className="shrink-0 rounded-sm border border-gray-200 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-50"
            >
              {t("highlightedGear.viewAll")}
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {highlightProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
