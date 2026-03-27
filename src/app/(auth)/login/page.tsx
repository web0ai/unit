"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback${invite ? `?next=/invite/${invite}` : ""}`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = invite ? `/invite/${invite}` : "/dashboard";
      }
    }
    setLoading(false);
  }

  async function handleGoogleAuth() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback${invite ? `?next=/invite/${invite}` : ""}`,
      },
    });
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo + tagline */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-bold text-olive tracking-tight">
            unit
          </h1>
          <p className="text-muted-text text-sm mt-1">
            Your family, beautifully organized.
          </p>
        </div>

        {invite && (
          <div className="mb-6 p-3 rounded-[10px] bg-olive-light border border-border text-sm text-forest">
            You&apos;ve been invited to join a unit. Sign up or log in to accept.
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-forest mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-forest mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "Create a password" : "Your password"}
              required
              minLength={6}
              className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {message && (
            <p className="text-sm text-olive">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[10px] bg-olive text-cream font-heading text-[15px] font-semibold hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(96,108,56,0.25)] active:translate-y-0 transition-all duration-200 disabled:opacity-50"
          >
            {loading
              ? "..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-cream px-3 text-muted-text">or</span>
          </div>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleAuth}
          className="w-full py-3 rounded-[10px] border-[1.5px] border-border bg-surface text-forest font-medium text-[15px] hover:border-olive hover:-translate-y-px transition-all duration-200"
        >
          Continue with Google
        </button>

        {/* Toggle sign up / sign in */}
        <p className="text-center text-sm text-muted-text mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-olive font-medium hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
