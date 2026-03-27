"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-3xl font-bold text-forest">unit</h1>
          <p className="text-muted-foreground text-sm">
            Your family, beautifully organized.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-forest mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-forest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-olive"
            />
          </div>

          <button className="w-full py-2.5 rounded-lg bg-olive text-cream font-medium hover:bg-olive/90 transition-colors">
            Continue with email
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-cream px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-lg border border-border bg-white text-forest font-medium hover:bg-muted transition-colors">
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
