"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  Folder,
  Home,
  Library,
  Plus,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/assignments", label: "Assignments", icon: BookOpen },
  { href: "#", label: "Library", icon: Library },
  { href: "#", label: "AI Toolkit", icon: Bot },
  { href: "#", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-8 top-8 bottom-8 z-40 w-64 flex-col rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8b84e] text-lg font-black text-black">
          V
        </div>
        <div>
          <p className="text-lg font-black tracking-tight text-slate-950">
            VedaAI
          </p>
          <p className="text-xs font-medium text-slate-400">
            Teacher Dashboard
          </p>
        </div>
      </div>

      <Link
        href="/assignments/create"
        className="mb-7 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#f8b84e] bg-black px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:scale-[1.01]"
      >
        <Plus size={18} />
        Create Assignment
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active =
            item.href !== "/" &&
            pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-slate-950 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-3xl bg-slate-100 p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
          <Folder size={18} />
        </div>
        <p className="text-sm font-bold text-slate-950">
          Delhi Public School
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Sector-4, Bokaro
        </p>
      </div>
    </aside>
  );
}
