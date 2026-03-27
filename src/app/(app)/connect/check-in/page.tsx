"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCheckInResponses, getQuestions } from "@/hooks/use-checkins";
import { usePartnerProfiles } from "@/hooks/use-unit";

export default function CheckInPage() {
  return (
    <Suspense>
      <CheckInFlow />
    </Suspense>
  );
}

function CheckInFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkInId = searchParams.get("id");
  const { responses, submitResponse } = useCheckInResponses(checkInId);
  const partners = usePartnerProfiles();
  const [checkIn, setCheckIn] = useState<{ cadence: string; depth: string; status: string } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      if (checkInId) {
        const { data } = await supabase
          .from("check_ins")
          .select("cadence, depth, status")
          .eq("id", checkInId)
          .single();
        if (data) setCheckIn(data);
      }
    }
    load();
  }, [checkInId, supabase]);

  useEffect(() => {
    if (userId && responses.find((r) => r.user_id === userId)) {
      setSubmitted(true);
    }
  }, [responses, userId]);

  if (!checkInId || !checkIn) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-muted-text text-sm">Loading check-in...</p>
      </div>
    );
  }

  const questions = getQuestions(checkIn.depth, checkIn.cadence);
  const myResponse = responses.find((r) => r.user_id === userId);
  const partnerResponse = responses.find((r) => r.user_id !== userId);
  const bothSubmitted = checkIn.status === "completed" || responses.length >= 2;
  const me = partners.find((p) => p.id === userId);
  const partner = partners.find((p) => p.id !== userId);

  async function handleSubmit() {
    await submitResponse(answers);
    setSubmitted(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-[26px] font-semibold text-forest">Check-in</h1>
          <p className="text-xs text-muted-text capitalize">
            {checkIn.depth.replace("-", " ")} · {checkIn.cadence}
          </p>
        </div>
        <button
          onClick={() => router.push("/connect")}
          className="text-xs text-muted-text hover:text-olive transition-colors"
        >
          ← Back
        </button>
      </div>

      {submitted && !bothSubmitted && (
        <div className="rounded-[14px] border border-amber/35 bg-gradient-to-r from-amber/[0.13] to-amber/[0.06] p-4 text-center">
          <p className="font-heading font-semibold text-forest">Waiting for your partner</p>
          <p className="text-[13px] text-muted-text mt-1">
            You&apos;ve submitted your answers. Your partner&apos;s responses will appear once they submit too.
          </p>
        </div>
      )}

      {bothSubmitted && (
        <div className="rounded-[14px] border border-olive/30 bg-olive-light p-4 text-center">
          <p className="font-heading font-semibold text-olive">Check-in complete!</p>
          <p className="text-[13px] text-muted-text mt-1">
            Both of you have shared. Scroll down to see each other&apos;s answers.
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={i} className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-text mb-1">
              Question {i + 1}
            </p>
            <p className="font-heading text-[15px] font-semibold text-forest mb-4 leading-snug">
              {q.label}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* My column */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-amber" />
                  <span className="text-xs font-medium text-muted-text">
                    {me?.name || "You"}
                  </span>
                </div>
                {submitted ? (
                  <div className="px-3 py-2 rounded-[10px] bg-cream border border-border text-sm text-forest">
                    {myResponse?.responses[`q${i}`] || answers[`q${i}`] || "—"}
                  </div>
                ) : q.type === "scale" ? (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={answers[`q${i}`] || "5"}
                    onChange={(e) => setAnswers({ ...answers, [`q${i}`]: e.target.value })}
                    className="w-full accent-olive"
                  />
                ) : (
                  <textarea
                    placeholder="Your answer..."
                    value={answers[`q${i}`] || ""}
                    onChange={(e) => setAnswers({ ...answers, [`q${i}`]: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all resize-none"
                  />
                )}
                {q.type === "scale" && !submitted && (
                  <p className="text-center text-xs text-muted-text mt-1">{answers[`q${i}`] || "5"} / 10</p>
                )}
              </div>

              {/* Partner column */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-olive" />
                  <span className="text-xs font-medium text-muted-text">
                    {partner?.name || "Partner"}
                  </span>
                </div>
                {bothSubmitted && partnerResponse ? (
                  <div className="px-3 py-2 rounded-[10px] bg-cream border border-border text-sm text-forest">
                    {partnerResponse.responses[`q${i}`] || "—"}
                  </div>
                ) : (
                  <div className="px-3 py-2 rounded-[10px] bg-muted border border-border text-sm text-muted-text italic">
                    {submitted ? "Waiting..." : "Hidden until you both submit"}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-[10px] bg-olive text-cream font-heading text-[15px] font-semibold hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(96,108,56,0.25)] active:translate-y-0 transition-all duration-200"
        >
          Submit my answers
        </button>
      )}
    </div>
  );
}
