"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Clock3,
  Ellipsis,
  FolderHeart,
  LibraryBig,
  PanelLeft,
  PlusCircle,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useDemoState } from "@/lib/mock/store";

const navItems = [
  { href: "/", label: "新的对话", icon: PlusCircle },
  { href: "/templates", label: "指令库", icon: LibraryBig },
  { href: "/schedules", label: "定时任务", icon: Clock3 },
  { href: "/artifacts", label: "收藏夹", icon: FolderHeart },
];

type MoreDataShellProps = {
  currentPath: string;
  children: ReactNode;
  rightRail?: ReactNode;
  currentRunLabel?: string;
  mainDecoration?: ReactNode;
};

export function MoreDataShell({
  currentPath,
  children,
  rightRail,
  currentRunLabel,
  mainDecoration,
}: MoreDataShellProps) {
  const { currentRunId, runs } = useDemoState();
  const recentRuns = runs.slice(0, 4);
  const showRecentActive = currentPath === "/agent";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-transparent">
      <div
        className="grid min-h-screen overflow-hidden bg-[rgba(250,249,245,0.82)]"
        style={{ gridTemplateColumns: sidebarCollapsed ? "80px minmax(0,1fr)" : "272px minmax(0,1fr)" }}
      >
        <aside className={`relative border-r border-[#e2e7ef] bg-[rgba(255,255,255,0.76)] py-7 backdrop-blur-xl transition-[padding,width] ${sidebarCollapsed ? "px-4" : "px-6"}`}>
          <div className="relative">
            {sidebarCollapsed ? (
              <div className="flex justify-center">
                <BrandLogo compact />
              </div>
            ) : (
              <div>
                <div className="px-1">
                  <BrandLogo />
                </div>
              </div>
            )}

            <nav className="mt-6 space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = currentPath === href || (href === "/" && currentPath === "/agent");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center rounded-[14px] py-3 text-[15px] transition ${
                    active
                        ? "bg-[linear-gradient(180deg,#f5f5f5,#efefef)] font-medium text-[#18181b] shadow-[0_12px_24px_rgba(24,24,27,0.06)] ring-1 ring-[#e4e4e7]"
                        : "text-[#74839a] hover:bg-[#f2f5fa] hover:text-[#243248]"
                  } ${sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"}`}
                    title={sidebarCollapsed ? label : undefined}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-[#18181b]" : "text-[#8d9cb1] group-hover:text-[#18181b]"}`} />
                    {!sidebarCollapsed ? (
                      <>
                        <span>{label}</span>
                      </>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {!sidebarCollapsed ? <div className="mt-10">
              <div className="flex items-center justify-between px-2 text-xs text-[#7f8da0]">
                <span>任务记录</span>
                <div className="h-4 w-4 rounded-full border border-[#d8dee8]" />
              </div>
              <div className="mt-2 space-y-2">
                {recentRuns.map((run, index) => (
                  <div
                    key={run.id}
                    className={`flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-[13px] transition ${
                      (run.id === currentRunId || (index === 0 && showRecentActive)) && currentPath === "/agent"
                        ? "border border-[#e4e4e7] bg-[#f4f4f5] text-[#18181b]"
                        : "border border-transparent text-[#7d8795] hover:border-[#d9e0eb] hover:bg-[#f7f9fc] hover:text-[#243248]"
                    }`}
                  >
                    <Link href={`/agent?runId=${run.id}`} className="min-w-0 flex-1 truncate">
                      {run.title}
                    </Link>
                    <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8c97a6] transition hover:bg-white">
                      <Ellipsis className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div> : null}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col bg-transparent">
          <header className="flex h-[58px] items-center justify-between border-b border-[#e3e8ef] bg-[rgba(255,255,255,0.68)] px-6 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-3">
              <Button aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"} variant="ghost" size="icon" className="h-8 w-8 rounded-[10px] text-[#7e8da0]" onClick={() => setSidebarCollapsed((current) => !current)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              {currentRunLabel ? (
                <div className="min-w-0 truncate text-[15px] font-medium text-[#243248]">
                  {currentRunLabel}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3 text-sm text-[#7c8ca0]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181b] text-sm font-semibold text-white">
                用
              </div>
            </div>
          </header>

          <div className={`min-h-0 flex-1 ${rightRail ? "grid grid-cols-[minmax(0,1fr)_minmax(580px,61%)]" : ""}`}>
            <div className="relative min-w-0 overflow-auto">
              {mainDecoration ? <div className="pointer-events-none absolute inset-0">{mainDecoration}</div> : null}
              <div className="relative z-[1]">{children}</div>
            </div>
            {rightRail ? <aside className="border-l border-[#e3e8ef] bg-[rgba(255,255,255,0.7)] backdrop-blur-xl">{rightRail}</aside> : null}
          </div>
        </main>
      </div>

    </div>
  );
}
