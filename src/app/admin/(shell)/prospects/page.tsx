import { prospectRepository } from "@/repositories/implementations/PrismaProspectRepository";
import { ProspectsManager } from "@/components/admin/ProspectsManager";

export const dynamic = "force-dynamic";

export default async function AdminProspectsPage() {
  const prospects = await prospectRepository.findAll();

  return <ProspectsManager initialProspects={prospects} />;
}
