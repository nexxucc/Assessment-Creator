"use client";

type Props = {
  step: 1 | 2;
};

export function StepIndicator({ step }: Props) {
  return (
    <div className="mx-auto mb-8 w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400">
        <span className={step >= 1 ? "text-slate-950" : ""}>
          Assignment Details
        </span>
        <span className={step >= 2 ? "text-slate-950" : ""}>
          Questions
        </span>
      </div>

      <div className="grid h-2 grid-cols-2 gap-2">
        <div className="rounded-full bg-black" />
        <div className={step === 2 ? "rounded-full bg-black" : "rounded-full bg-slate-200"} />
      </div>
    </div>
  );
}
