import { useState, type ReactNode } from "react";
import { BookMarked, Bot, Brain, GraduationCap, LayoutDashboard, LineChart, LogOut, Menu, Timer, User, X } from "lucide-react";
import { initials, useStudy } from "@/lib/study/store";

export type Section = "dashboard" | "subjects" | "quiz" | "timer" | "tutor" | "progress" | "profile";
export const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "subjects", label: "My Subjects", icon: BookMarked },
  { id: "quiz", label: "Practice Quiz", icon: Brain },
  { id: "timer", label: "Study Timer", icon: Timer },
  { id: "tutor", label: "AI Tutor", icon: Bot },
  { id: "progress", label: "Learning Progress", icon: LineChart },
  { id: "profile", label: "Profile", icon: User },
];

export function AppShell({ section, go, children }: { section: Section; go: (s: Section) => void; children: ReactNode }) {
  const { user, logout } = useStudy();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ id, label, icon: Icon }) => {
        const active = id === section;
        return (
          <button key={id} onClick={() => { go(id); setOpen(false); }} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
            <Icon className="h-4.5 w-4.5" /> {label}
          </button>
        );
      })}
      <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10">
        <LogOut className="h-4.5 w-4.5" /> Logout
      </button>
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></div>
      <span className="font-display text-lg font-bold">StudyMate</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        {brand}
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="animate-rise absolute inset-y-0 left-0 flex w-72 flex-col gap-8 bg-sidebar p-5 shadow-soft">
            <div className="flex items-center justify-between">{brand}<button aria-label="Close menu" onClick={() => setOpen(false)} className="btn btn-outline p-2"><X className="h-4 w-4" /></button></div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="btn btn-outline p-2 lg:hidden"><Menu className="h-5 w-5" /></button>
            <span className="lg:hidden">{brand}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => go("profile")} className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-muted">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{initials(user.name)}</span>
              <span className="hidden text-sm font-semibold sm:inline">{user.name}</span>
            </button>
            <button onClick={logout} className="btn btn-outline px-3 py-2 text-sm"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
