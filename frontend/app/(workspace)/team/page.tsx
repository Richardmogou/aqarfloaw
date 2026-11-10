import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth";

export default async function TeamPage() {
  await requireUser("admin");
  return <PlaceholderPage title="Team" description="View your agency agents." day="Day 5" />;
}
