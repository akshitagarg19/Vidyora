import { useState } from "react";
import { BookCheck, Brain, CalendarDays, Clock, Flame, History, LogOut, Pencil, Sparkles, Target, Trophy } from "lucide-react";
import { toast } from "sonner";
import { formatDuration, initials, useStudy } from "@/lib/study/store";
import { EmptyState, PageHeader, ProgressBar, StatCard, WeeklyChart, subjectIcon } from "./ui";
import type { Section } from "./AppShell";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function GoalCard() {
  const { user, update, stats } = useStudy();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(user?.dailyGoalMin ?? 60));
  if (!user) return null;
  const goalSec = user.dailyGoalMin * 60;
  const pct = (stats.todaySeconds / goalSec) * 100;
  const remaining = Math.max(0, goalSec - stats.todaySeconds);
  const save = () => {
    const n = Number(val);
    if (!Number.isInteger(n) || n < 5 || n > 720) { toast.error("Enter a whole number of minutes between 5 and 720."); return; }
    update((u) => ({ ...u, dailyGoalMin: n }));
    setEditing(false);
    toast.success(`Daily goal set to ${n} minutes`);
  };
  return (
    <div className="card-soft p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Target className="h-5 w-5 text-primary" /> Daily study progress</h2>
        {!editing && <button className="btn btn-soft shrink-0 whitespace-nowrap px-3 py-1.5 text-sm" onClick={() => { setVal(String(user.dailyGoalMin)); setEditing(true); }}><Pencil className="h-3.5 w-3.5" /> Set goal</button>}
      </div>
      {editing && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <input type="number" min={5} max={720} className="field max-w-[140px]" value={val} onChange={(e) => setVal(e.target.value)} aria-label="Daily goal in minutes" />
          <span className="text-sm text-muted-foreground">minutes</span>
          <button className="btn btn-primary py-2" onClick={save}>Update Daily Goal</button>
          <button className="btn btn-outline py-2" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[["Daily goal", `${user.dailyGoalMin}m`], ["Studied today", formatDuration(stats.todaySeconds)], ["Remaining", remaining ? formatDuration(remaining) : "Done! 🎉"]].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 font-display font-bold">{v}</p></div>
        ))}
      </div>
      <div className="mt-5"><ProgressBar value={pct} tone={pct >= 100 ? "success" : "primary"} /></div>
      <p className="mt-2 text-sm text-muted-foreground">{Math.min(100, Math.round(pct))}% of today's goal</p>
    </div>
  );
}

export function Dashboard({ go }: { go: (s: Section) => void }) {
  const { user, stats } = useStudy();
  if (!user) return null;
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="space-y-6">
      <section className="bg-gradient-primary animate-rise relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-glow sm:p-8">
        <p className="flex items-center gap-2 text-sm opacity-90"><CalendarDays className="h-4 w-4" /> {date}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{greeting()}, {user.name}!</h1>
        <p className="mt-2 opacity-90">Ready to make today a productive learning day?</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn bg-card text-primary" onClick={() => go("timer")}><Clock className="h-4 w-4" /> Start studying</button>
          <button className="btn border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => go("quiz")}><Brain className="h-4 w-4" /> Take a quiz</button>
        </div>
        <Sparkles className="absolute -right-4 -top-4 h-40 w-40 opacity-10" />
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Total Study Time" value={formatDuration(stats.totalSeconds)} />
        <StatCard icon={BookCheck} label="Topics Completed" value={stats.topicsCompleted} tone="success" />
        <StatCard icon={Trophy} label="Quizzes Completed" value={stats.quizzesCompleted} />
        <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} day${stats.streak === 1 ? "" : "s"}`} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2"><GoalCard /></div>
        <div className="card-soft p-6 lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold">Weekly study activity</h2>
          <WeeklyChart data={stats.week} />
        </div>
      </div>
    </div>
  );
}

export function Progress() {
  const { user, stats, subjects } = useStudy();
  if (!user) return null;
  const nameOf = (id: string) => subjects.find((s) => s.id === id)?.name ?? "Subject";
  const isNew = stats.totalSeconds === 0 && stats.topicsCompleted === 0 && stats.quizzesCompleted === 0;
  return (
    <div className="space-y-6">
      <PageHeader title="Learning Progress" subtitle={isNew ? "Your learning journey starts here!" : "Every minute counts. Here's how far you've come."} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Total study hours" value={(stats.totalSeconds / 3600).toFixed(1)} hint={formatDuration(stats.totalSeconds)} />
        <StatCard icon={BookCheck} label="Topics completed" value={stats.topicsCompleted} tone="success" />
        <StatCard icon={Trophy} label="Quizzes completed" value={stats.quizzesCompleted} />
        <StatCard icon={Target} label="Average quiz score" value={`${stats.avgScore}%`} tone="success" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-soft p-6">
          <h2 className="mb-4 text-lg font-bold">Subject-wise progress</h2>
          <div className="space-y-4">
            {subjects.map((s) => {
              const done = s.topics.filter((t) => user.completedTopics[`${s.id}::${t}`]).length;
              const Icon = subjectIcon(s.id);
              return (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-primary" />{s.name}</span>
                    <span className="text-muted-foreground">{done}/{s.topics.length}</span>
                  </div>
                  <ProgressBar value={(done / s.topics.length) * 100} tone="success" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="card-soft p-6"><h2 className="mb-4 text-lg font-bold">Weekly study activity</h2><WeeklyChart data={stats.week} /></div>
        <div className="card-soft p-6">
          <h2 className="mb-4 text-lg font-bold">Recent study sessions</h2>
          {user.sessions.length === 0 ? <EmptyState icon={History} title="No sessions yet" text="Use the Study Timer to log your first focused session." /> : (
            <ul className="divide-y divide-border">
              {user.sessions.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div><p className="font-medium">{s.topic}</p><p className="text-xs text-muted-foreground">{nameOf(s.subjectId)} · {new Date(s.endedAt).toLocaleString()}</p></div>
                  <span className="font-semibold text-primary">{formatDuration(s.seconds)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card-soft p-6">
          <h2 className="mb-4 text-lg font-bold">Recent quiz results</h2>
          {user.quizzes.length === 0 ? <EmptyState icon={Brain} title="No quizzes yet" text="Take a practice quiz to see your scores here." /> : (
            <ul className="divide-y divide-border">
              {user.quizzes.slice(0, 6).map((q) => {
                const pct = Math.round((q.correct / q.total) * 100);
                return (
                  <li key={q.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div><p className="font-medium">{q.topic}</p><p className="text-xs text-muted-foreground">{nameOf(q.subjectId)} · {new Date(q.at).toLocaleDateString()}</p></div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pct >= 60 ? "bg-success-soft text-success" : "bg-secondary text-secondary-foreground"}`}>{q.correct}/{q.total} · {pct}%</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, stats, rename, logout } = useStudy();
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const save = () => {
    const err = rename(name);
    setError(err);
    if (!err) toast.success("Profile updated");
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your study identity." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-soft flex flex-col items-center p-6 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-primary font-display text-3xl font-bold text-primary-foreground shadow-glow">{initials(user.name)}</div>
          <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">Student</p>
          <button onClick={logout} className="btn btn-outline mt-6 w-full text-destructive"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Clock} label="Total study time" value={formatDuration(stats.totalSeconds)} />
            <StatCard icon={BookCheck} label="Topics completed" value={stats.topicsCompleted} tone="success" />
            <StatCard icon={Trophy} label="Quizzes completed" value={stats.quizzesCompleted} />
            <StatCard icon={Target} label="Daily study goal" value={`${user.dailyGoalMin} min`} tone="success" />
          </div>
          <div className="card-soft p-6">
            <h3 className="mb-3 font-bold">Update display name</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input className="field" value={name} maxLength={40} onChange={(e) => { setName(e.target.value); setError(null); }} aria-label="Display name" />
              <button className="btn btn-primary shrink-0" onClick={save}>Update Profile</button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
