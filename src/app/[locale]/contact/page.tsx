import { getTranslations } from "next-intl/server";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  const contactCards = [
    { icon: MapPin, overline: t("addressLabel"), text: t("addressValue") },
    { icon: Phone, overline: t("phoneLabel"), text: t("phoneValue") },
    { icon: MessageCircle, overline: t("whatsappLabel"), text: t("whatsappValue") },
    { icon: Mail, overline: t("emailLabel"), text: t("emailValue") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="grid gap-12 sm:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-xs font-semibold tracking-widest text-gray-400">
            {t("overline")}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {contactCards.map((c) => (
              <div
                key={c.overline}
                className="flex items-center gap-4 border border-gray-200 bg-white px-5 py-4"
              >
                <c.icon className="h-5 w-5 shrink-0 text-orange" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-widest text-gray-400">
                    {c.overline}
                  </p>
                  <p className="mt-0.5 font-mono text-sm text-black">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="border border-gray-200 bg-white px-8 py-10">
            <p className="mb-2 font-mono text-xs font-semibold tracking-widest text-gray-400">
              {t("form.overline")}
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t("form.title")}
            </h2>

            <form className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    {t("form.fullName")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("form.fullNamePlaceholder")}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    {t("form.company")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("form.companyPlaceholder")}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    {t("form.email")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("form.emailPlaceholder")}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    {t("form.whatsapp")}
                  </label>
                  <input
                    type="tel"
                    placeholder={t("form.whatsappPlaceholder")}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                  {t("form.requirements")}
                </label>
                <textarea
                  rows={5}
                  placeholder={t("form.requirementsPlaceholder")}
                  className="w-full resize-y border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-sm bg-yellow px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                {t("form.submit")}
              </button>
              <p className="text-[10px] text-gray-400">
                {t("form.disclaimer")}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
