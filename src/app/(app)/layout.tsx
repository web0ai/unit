import { AppNav } from "@/components/layout/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: "#FEFAE0" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col z-40"
        style={{
          backgroundColor: "#FEFAE0",
          borderRight: "1px solid #e0d9b8",
        }}
      >
        <AppNav variant="sidebar" />
      </aside>

      {/* Main content — bottom padding accounts for mobile nav height + safe area */}
      <main
        className="md:pl-56"
        style={{
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="md:pb-0">
          <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 md:hidden z-40"
        style={{
          backgroundColor: "#FEFAE0",
          borderTop: "1px solid #e0d9b8",
        }}
      >
        <AppNav variant="bottom" />
      </nav>
    </div>
  );
}
