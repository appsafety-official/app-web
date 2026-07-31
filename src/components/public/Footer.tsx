import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Footer() {
  const t = await getTranslations("common.footer");
  const nt = await getTranslations("common.navbar");

  return (
    <footer>
      <div className="bg-black px-4 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-1 font-mono text-xs font-semibold tracking-widest text-orange">
              {t("enterpriseProcurement")}
            </p>
            <h3 className="text-lg leading-relaxed sm:text-xl">
              {t("bannerText")}
            </h3>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-sm bg-yellow px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            {t("requestQuote")}
          </Link>
        </div>
      </div>

      <div className="bg-gray-950 px-4 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <img src="/images/logo-app.png" alt="APP SAFETY" className="h-7 w-auto brightness-0 invert" />
                <span className="font-mono text-lg font-bold tracking-wide text-white">APP SAFETY</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-gray-500">
                {t("companyDesc")}
              </p>
              <p className="font-mono text-[10px] tracking-wider text-gray-500">
                {t("isoBadge")}
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-gray-300">
                {t("explore")}
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/" className="text-gray-500 transition-colors hover:text-white">
                  {nt("home")}
                </Link>
                <Link href="/products" className="text-gray-500 transition-colors hover:text-white">
                  {nt("products")}
                </Link>
                <Link href="/about" className="text-gray-500 transition-colors hover:text-white">
                  {nt("about")}
                </Link>
                <Link href="/contact" className="text-gray-500 transition-colors hover:text-white">
                  {nt("contact")}
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-gray-300">
                {t("contact")}
              </h4>
              <div className="flex flex-col gap-1 text-sm text-gray-500">
                <span>{t("companyName")}</span>
                <span>{t("address")}</span>
                <span>{t("city")}</span>
                <span className="mt-2">{t("phone")}</span>
                <span>{t("email")}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-800 pt-6 text-[10px] text-gray-600 sm:flex-row">
            <span>{t("copyright")}</span>
            <span className="font-mono">{t("version")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
