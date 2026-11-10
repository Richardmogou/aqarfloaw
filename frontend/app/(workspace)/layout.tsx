import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AqarFlowBackground } from "@/components/layout/aqarflow-background";
import { requireUser } from "@/lib/auth";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AqarFlowBackground />
        <div className="relative z-10">
          <Topbar user={user} />
        </div>
        <main className="relative z-10 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
