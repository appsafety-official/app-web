import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell userEmail={session.user.email ?? ""}>{children}</AdminShell>
  );
}
