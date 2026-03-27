"use client";

import { useState } from "react";

const steps = [
  "Who are you",
  "Your unit",
  "What matters most",
  "Why are you here",
  "First goals",
  "Family theme",
  "Your cadence",
  "Make it yours",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-dvh flex flex-col bg-cream">
      {/* Progress */}
      <div className="px-4 pt-6">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-olive" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="font-heading text-2xl font-bold text-forest">
            {steps[step]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Step content will be built in Phase 1.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-8 flex gap-3 max-w-md mx-auto w-full">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-2.5 rounded-lg border border-border text-forest font-medium"
          >
            Back
          </button>
        )}
        <button
          onClick={() =>
            step < steps.length - 1
              ? setStep(step + 1)
              : (window.location.href = "/dashboard")
          }
          className="flex-1 py-2.5 rounded-lg bg-olive text-cream font-medium"
        >
          {step < steps.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
}
