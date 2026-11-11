import type { Metadata } from "next";
import { ContactButtons } from "@/components/public/contact-buttons";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getL } from "@/lib/i18n/server";
import { AGENTS, WORKSPACE_PROPERTIES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Our agents" };

export default function AgentsPage() {
  const L = getL();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{L("Our agents", "Nos agents")}</h1>
      <p className="mt-2 text-muted-foreground">{L("Talk to an agent who knows your neighbourhood.", "Parlez à un agent qui connaît votre quartier.")}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a) => {
          const n = WORKSPACE_PROPERTIES.filter((p) => p.agentId === a.id && p.published).length;
          return (
            <Card key={a.id}>
              <div className="flex items-center gap-4">
                <Avatar name={a.name} className="h-14 w-14 text-lg" />
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{L("Property consultant", "Conseiller immobilier")}</p>
                  <p className="text-xs text-muted-foreground">{n} {L("active listings", "annonces actives")}</p>
                </div>
              </div>
              <ContactButtons className="mt-5" message={`Hello ${a.name}, I would like to talk about a property on AqarFlow.`} callLabel={L("Call", "Appeler")} waLabel="WhatsApp" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}