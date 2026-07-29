import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "APP SAFETY | Premium Industrial Safety Apparel",
  description:
    "PT Arie Putra Permana — supplying certified industrial safety apparel, firefighter suits, welding gear, and hazmat protection since 2015.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-black">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
