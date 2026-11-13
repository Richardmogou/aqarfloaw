import { PageHeader } from "@/components/ui/page-header";
import { TeamManager } from "@/features/team/team-manager";
import { requireUser } from "@/lib/auth";
import { getL } from "@/lib/i18n/server";
import type { TeamMember } from "@/lib/leads";
import { serverApi } from "@/lib/server-api";

export default async function TeamPage() {
  const L = getL();
  const [user, members] = await Promise.all([
    requireUser(),
    serverApi<TeamMember[]>("/users/team"),
  ]);
  return (
    <>
      <PageHeader
        title={L("Team", "Équipe")}
        description={L("Agents of your agency and their current workload.", "Les agents de votre agence et leur charge actuelle.")}
      />
      <TeamManager members={members} currentUserId={user.id} isAdmin={user.role === "admin"} />
    </>
  );
}
