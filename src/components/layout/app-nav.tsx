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
        <div className="p-5 border-b" style={{ borderColor: "#e0d9b8" }}>
          <Link
            href="/dashboard"
            className="font-heading text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm"
            style={{ color: "#283618", outlineColor: "#606C38" }}
          >
            unit
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: active ? "#606C38" : "transparent",
                  color: active ? "#FEFAE0" : "#283618",
                  outlineColor: "#606C38",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#f0f2e4";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span className="text-base" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <nav
      className="flex justify-around items-end"
      style={{
        paddingTop: "6px",
        paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Main navigation"
    >
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center gap-0.5 min-w-0 px-1 py-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={{
              color: active ? "#606C38" : "#5a6342",
              fontWeight: active ? 500 : 400,
              outlineColor: "#606C38",
              fontSize: "10px",
              lineHeight: "1.2",
            }}
          >
            <span
              className="text-lg leading-none"
              aria-hidden="true"
              style={{ fontSize: "20px" }}
            >
              {link.icon}
            </span>
            <span className="truncate max-w-full">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
