import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-10">
      <div
        className="relative mx-auto max-w-[1700px] rounded-[2rem] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        style={{ background: "var(--panel-bg)", backdropFilter: "var(--panel-filter)" }}
      >
        <TopNav />
        {children}
      </div>
    </div>
  );
}
