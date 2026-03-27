export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Good morning</h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Check-in banner */}
      <div className="rounded-xl border border-border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold">Couple check-in</h2>
          <span className="text-xs text-muted-foreground">Weekly</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your next check-in is coming up.
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs rounded-lg bg-olive text-cream font-medium">
            Start check-in
          </button>
          <button className="px-3 py-1.5 text-xs rounded-lg border border-border text-forest font-medium">
            Send reminder
          </button>
        </div>
      </div>

      {/* Goals placeholder */}
      <div>
        <h2 className="font-heading font-semibold mb-3">Family Goals</h2>
        <p className="text-sm text-muted-foreground">
          No goals yet. Add your first shared goal.
        </p>
      </div>

      {/* Pillars overview */}
      <div>
        <h2 className="font-heading font-semibold mb-3">Your pillars</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: "Us", desc: "Your identity", href: "/us" },
            { name: "Connect", desc: "Check-ins", href: "/connect" },
            { name: "Life", desc: "Adventures", href: "/life" },
            { name: "Money", desc: "Finances", href: "/money" },
            { name: "Vault", desc: "Documents", href: "/vault" },
          ].map((p) => (
            <a
              key={p.name}
              href={p.href}
              className="rounded-xl border border-border bg-white p-4 hover:border-olive transition-colors"
            >
              <h3 className="font-heading font-semibold text-sm">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
