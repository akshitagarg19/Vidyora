import type { LucideIcon } from "lucide-react";
import { BarChart3, BookOpen, Calculator, Code2, Database, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const SUBJECT_ICONS: Record<string, LucideIcon> = { math: Calculator, english: BookOpen, stats: BarChart3, python: Code2, ds: Database };
export const subjectIcon = (id: string) => SUBJECT_ICONS[id] ?? Sparkles;

export function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: { icon: LucideIcon; label: string; value: string | number; hint?: string; tone?: "primary" | "success" }) {
  return (
    <div className="card-soft hover-lift animate-rise p-5">
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${tone === "success" ? "bg-success-soft text-success" : "bg-secondary text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-500 ${tone === "success" ? "bg-gradient-success" : "bg-gradient-primary"}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary"><Icon className="h-5 w-5" /></div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function WeeklyChart({ data }: { data: { day: string; minutes: number }[] }) {
  const empty = data.every((d) => d.minutes === 0);
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-glow)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, empty ? 60 : "auto"]} />
          <Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v: number) => [`${v} min`, "Studied"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
          <Bar dataKey="minutes" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
      {empty && <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">No study sessions this week yet — start the timer!</p>}
    </div>
  );
}
