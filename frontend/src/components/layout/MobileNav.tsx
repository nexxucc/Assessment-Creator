"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Bot, Home, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/assignments", label: "Assignments", icon: BookOpen },
  { href: "#", label: "Library", icon: Library },
  { href: "#", label: "AI Toolkit", icon: Bot }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 grid grid-cols-4 rounded-[28px] bg-black p-2 shadow-2xl lg:hidden">
      {items.map(item => {
        const Icon = item.icon;
        const active =
          item.href !== "/" &&
          pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold",
              active ? "bg-white text-black" : "text-white/65"
            )}
          >
            <Icon size={17} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
