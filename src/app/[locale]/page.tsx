import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ShieldCheck, Truck, Ruler, Headset } from "lucide-react";
import ProductCard from "@/components/public/ProductCard";
import ClientsMarquee from "@/components/public/ClientsMarquee";
import { LeadMagnetWidget } from "@/components/public/LeadMagnetWidget";
import { getActiveLeadMagnet } from "@/actions/leadMagnetActions";
import { productRepository } from "@/repositories/product.repository";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const ft = await getTranslations({ locale, namespace: "home.features" });
  const ct = await getTranslations({ locale, namespace: "home.clients" });

  const allProducts = await productRepository.findAll();
  const highlightProducts = allProducts.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
  }));

  const features = [
    { icon: ShieldCheck, title: ft("qualityTitle"), desc: ft("qualityDesc") },
    { icon: Truck, title: ft("deliveryTitle"), desc: ft("deliveryDesc") },
    { icon: Ruler, title: ft("sizingTitle"), desc: ft("sizingDesc") },
    { icon: Headset, title: ft("expertTitle"), desc: ft("expertDesc") },
  ];

  const clients = [
    { src: "/images/logo-partner/logo-pertamina-removebg-preview.webp", name: "Pertamina" },
    { src: "/images/logo-partner/logo-pindad-removebg-preview.webp", name: "Pindad" },
    { src: "/images/logo-partner/logo-bnpb-removebg-preview%20(1).png", name: "BNPB" },
    { src: "/images/logo-partner/logo-hpal-removebg-preview%20(1).png", name: "HPAL" },
    { src: "/images/logo-partner/logo-hjf-removebg-preview.webp", name: "HJF" },
    { src: "/images/logo-partner/logo-miniships-removebg-preview.webp", name: "Miniships" },
    { src: "/images/logo-partner/logo-darma-persada-removebg-preview.webp", name: "Darma Persada" },
    { src: "/images/logo-partner/logo-triguna-mandala-removebg-preview.webp", name: "Triguna Mandala" },
    { src: "/images/logo-partner/logo-gearindo-swadaya-perkasa-removebg-preview.webp", name: "Gearindo Swadaya Perkasa" },
    { src: "/images/logo-partner/logo-swadaya-graha-removebg-preview%20(1).png", name: "Swadaya Graha" },
  ];

  const activeLeadMagnet = await getActiveLeadMagnet();

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
                {t("hero.title")}
                <br />
                {t("hero.titleLine2")}
                <br />
                <span className="whitespace-nowrap text-yellow">{t("hero.highlight")}</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-500 sm:text-base">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 hidden flex-wrap gap-4 sm:flex">
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
                {activeLeadMagnet && (
                  <LeadMagnetWidget leadMagnet={activeLeadMagnet} />
                )}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
                {[
                  { stat: "10+", label: t("stats.years") },
                  { stat: "500+", label: t("stats.clients") },
                  { stat: "ISO", label: t("stats.certified") },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="font-mono text-2xl font-bold text-black sm:text-3xl">
                      {item.stat}
                    </div>
                    <div className="mt-1 font-mono text-[10px] font-semibold tracking-widest text-gray-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-safety-image.jpg"
                alt={t("hero.imageBadge")}
                className="h-full w-full object-cover"
              />
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
            <div className="mt-8 flex flex-wrap gap-4 sm:hidden">
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
              {activeLeadMagnet && (
                <LeadMagnetWidget leadMagnet={activeLeadMagnet} />
              )}
            </div>

          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid border-y border-gray-200 sm:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`px-8 py-6 ${
                  i < features.length - 1 ? "sm:border-r sm:border-gray-200" : ""
                }`}
              >
                <f.icon className="mb-4 h-6 w-6 text-orange" strokeWidth={1.5} />
                <h3 className="mb-2 text-base font-bold text-black">{f.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
          <div className="mb-10">
            <p className="mb-1 font-mono text-xs font-semibold tracking-widest text-gray-400">
              {ct("overline")}
            </p>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              {ct("title")}
            </h2>
          </div>
        </div>
        <ClientsMarquee clients={clients} />
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
