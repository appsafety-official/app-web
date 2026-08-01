import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "rounded-none border border-stone-900 bg-white font-mono text-sm text-stone-900 shadow-none",
        }}
      />
    </NextIntlClientProvider>
  );
}
