import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AqarFlowBackground } from "@/components/layout/aqarflow-background";

// TODO J2 : protéger ce layout (session + rôle)
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AqarFlowBackground />
        <div className="relative z-10">
          <Topbar />
        </div>
        <main className="relative z-10 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
