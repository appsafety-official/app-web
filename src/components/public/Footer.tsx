import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      {/* Top Banner */}
      <div className="bg-black px-4 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-1 font-mono text-xs font-semibold tracking-widest text-orange">
              ENTERPRISE PROCUREMENT
            </p>
            <h3 className="text-lg leading-relaxed sm:text-xl">
              Bulk orders, tender documents, and technical spec sheets —
              handled by real safety engineers.
            </h3>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-sm bg-yellow px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Request a Quote
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-950 px-4 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-3">
            {/* Left */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center bg-white text-[10px] font-bold text-black">
                  APP
                </span>
                <span className="text-sm font-bold text-white">APP SAFETY</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-gray-500">
                PT Arie Putra Permana — supplying certified industrial safety
                apparel, firefighter suits, welding gear, and hazmat protection
                to leading industries across Indonesia.
              </p>
              <p className="font-mono text-[10px] tracking-wider text-gray-500">
                ISO 9001 - SNI CERTIFIED - TRUSTED SUPPLIER
              </p>
            </div>

            {/* Middle */}
            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-gray-300">
                EXPLORE
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  href="/"
                  className="text-gray-500 transition-colors hover:text-white"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-gray-500 transition-colors hover:text-white"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="text-gray-500 transition-colors hover:text-white"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-500 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Right */}
            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-gray-300">
                CONTACT
              </h4>
              <div className="flex flex-col gap-1 text-sm text-gray-500">
                <span>PT Arie Putra Permana</span>
                <span>Kota Harapan Indah</span>
                <span>Bekasi, Jawa Barat 17131</span>
                <span className="mt-2">Phone: +62 812-3456-7890</span>
                <span>Email: hello@appsafety.id</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-800 pt-6 text-[10px] text-gray-600 sm:flex-row">
            <span>&copy; 2026 APP SAFETY. All rights reserved.</span>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
