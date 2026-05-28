"use client";

import { Bell, ChevronDown, ChevronLeft, Grid2X2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function getBreadcrumb(pathname: string) {
  if (pathname.includes("/create")) return "Assignment";
  if (pathname.includes("/assignments/")) return "Assignment";
  return "Assignment";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="fixed left-3 right-3 top-3 z-30 h-14 rounded-2xl bg-white/75 pl-6 pr-3 backdrop-blur md:left-[327px] md:right-[13px]">
      <div className="flex h-full items-center gap-2.5">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full bg-white text-[var(--text-primary)]"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Grid2X2 size={20} className="text-[var(--text-muted)]" />
          <p className="truncate text-[16px] font-semibold tracking-[-0.64px] text-[var(--text-muted)]">
            {getBreadcrumb(pathname)}
          </p>
        </div>

        <button className="relative flex size-9 items-center justify-center rounded-full bg-[var(--bg-off-white-primary)]">
          <Bell size={20} className="text-[var(--text-primary)]" />
          <span className="absolute right-px top-px size-2 rounded-full bg-[var(--orange-primary)]" />
        </button>

        <div className="figma-shadow flex h-11 items-center gap-2 rounded-xl px-3 py-1.5">
          <div className="size-8 rounded-full bg-[var(--bg-off-white-primary)]" />
          <div className="hidden items-center gap-1 sm:flex">
            <p className="text-[16px] font-semibold tracking-[-0.64px] text-[var(--text-primary)]">
              John Doe
            </p>
            <ChevronDown size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}
