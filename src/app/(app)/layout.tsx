import { AppNav } from "@/components/layout/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col border-r border-border bg-cream z-30">
        <AppNav variant="sidebar" />
      </aside>

      {/* Main content */}
      <main className="pb-20 md:pb-0 md:pl-56">
        <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden border-t border-border bg-cream z-30">
        <AppNav variant="bottom" />
      </nav>
    </div>
  );
}
