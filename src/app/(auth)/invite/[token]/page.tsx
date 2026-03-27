"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStatus("ready");
      } else {
        // Redirect to login with invite token
        router.push(`/login?invite=${token}`);
      }
    }
    check();
  }, [token, router]);

  async function accept() {
    setStatus("accepting");
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setError("Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm text-center animate-fade-in space-y-6">
        <h1 className="font-heading text-2xl font-bold text-forest">
          You&apos;ve been invited
        </h1>
        <p className="text-muted-text text-sm">
          Your partner wants to start a unit with you.
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {status === "loading" && (
          <p className="text-sm text-muted-text">Checking...</p>
        )}

        {status === "ready" && (
          <button
            onClick={accept}
            className="w-full py-3 rounded-[10px] bg-olive text-cream font-heading text-[15px] font-semibold hover:bg-primary-hover hover:-translate-y-px transition-all duration-200"
          >
            Accept &amp; join the unit
          </button>
        )}

        {status === "accepting" && (
          <p className="text-sm text-olive">Joining...</p>
        )}

        {status === "error" && (
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-[10px] border-[1.5px] border-border text-forest font-medium hover:border-olive transition-all duration-200"
          >
            Go to login
          </button>
        )}
      </div>
    </div>
  );
}
