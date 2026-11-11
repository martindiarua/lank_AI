"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Clock, Bookmark, Settings, User } from "lucide-react";

const navItems = [
  { name: "Live", href: "/", icon: Mic },
  { name: "History", href: "/history", icon: Clock },
  { name: "Saved", href: "/saved", icon: Bookmark },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 h-screen fixed top-0 left-0 border-r bg-background z-50">
      <div className="flex h-16 items-center justify-center lg:justify-start lg:px-6 border-b">
        <span className="font-bold text-xl hidden lg:block">LANK AI</span>
        <span className="font-bold text-xl lg:hidden">L</span>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                isActive ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              <span className="hidden lg:block font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background flex items-center justify-around z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? "text-black dark:text-white" : "text-gray-500"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}