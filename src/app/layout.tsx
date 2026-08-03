import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
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
  title: "APP SAFETY | Pakaian Keselamatan Industri Premium",
  description:
    "PT Arie Putra Permana — penyedia pakaian keselamatan industri bersertifikat, jas pemadam kebakaran, peralatan las, dan perlindungan bahan berbahaya untuk industri terkemuka di Indonesia sejak 2015.",
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
        {children}
      </body>
    </html>
  );
}
