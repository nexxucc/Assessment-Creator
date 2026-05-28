"use client";

import { Sparkles } from "lucide-react";

type Props = {
  progress?: number;
  message?: string;
};

export function GeneratingLoader({
  progress = 20,
  message = "Generating your assignment..."
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f8b84e] text-black">
          <Sparkles className="animate-pulse" size={30} />
        </div>

        <h2 className="text-2xl font-black text-slate-950">
          Please wait
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-black transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="mt-3 text-xs font-bold text-slate-400">
          {Math.min(progress, 100)}% complete
        </p>
      </div>
    </div>
  );
}
