"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/us", label: "Us", icon: "♡" },
  { href: "/connect", label: "Connect", icon: "◎" },
  { href: "/life", label: "Life", icon: "✦" },
  { href: "/money", label: "Money", icon: "$" },
  { href: "/schedule", label: "Schedule", icon: "▦" },
  { href: "/vault", label: "Vault", icon: "⊡" },
];

export function AppNav({ variant }: { variant: "sidebar" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="font-heading text-xl font-bold text-forest">
            unit
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-olive text-cream"
                    : "text-forest hover:bg-muted"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  // Bottom nav — show top 5 items
  const bottomLinks = links.slice(0, 5);

  return (
    <div className="flex justify-around py-2">
      {bottomLinks.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
              active ? "text-olive font-medium" : "text-muted-foreground"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
