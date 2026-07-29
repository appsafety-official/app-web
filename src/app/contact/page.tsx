import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";

const contactCards = [
  { icon: MapPin, overline: "ADDRESS", text: "Jl. Industri Raya No. 12, Bekasi, Jawa Barat" },
  { icon: Phone, overline: "PHONE", text: "+62 812-3456-7890" },
  { icon: MessageCircle, overline: "WHATSAPP", text: "+62 812-3456-7890" },
  { icon: Mail, overline: "EMAIL", text: "sales@appsafety.co.id" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="grid gap-12 sm:grid-cols-2">
        {/* Left: Contact Info */}
        <div>
          <p className="mb-4 font-mono text-xs font-semibold tracking-widest text-gray-400">
            CONTACT
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Talk to our <br />
            safety engineers.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
            Bulk quotes, custom sizing, or tender documentation — send us the
            brief and we&rsquo;ll come back within one business day.
          </p>

          {/* Info Cards */}
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

        {/* Right: Contact Form */}
        <div>
          <div className="border border-gray-200 bg-white px-8 py-10">
            <p className="mb-2 font-mono text-xs font-semibold tracking-widest text-gray-400">
              REQUEST A QUOTE
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Send us your requirements
            </h2>

            <form className="mt-8 space-y-5">
              {/* Row 1 */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    COMPANY
                  </label>
                  <input
                    type="text"
                    placeholder="PT Contoh"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.co.id"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                    WHATSAPP *
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 ..."
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold tracking-wider text-gray-500">
                  REQUIREMENTS *
                </label>
                <textarea
                  rows={5}
                  placeholder="Product, quantity, sizing, delivery timeline..."
                  className="w-full resize-y border border-gray-200 px-3 py-2.5 text-sm text-black placeholder-gray-300 outline-none transition-colors focus:border-black"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-sm bg-yellow px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Send Quote Request
              </button>
              <p className="text-[10px] text-gray-400">
                By submitting you agree to be contacted about your inquiry.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
