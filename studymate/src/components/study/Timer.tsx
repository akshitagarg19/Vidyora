import { useEffect, useRef, useState } from "react";
import { Flag, History, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDuration, uid, useStudy } from "@/lib/study/store";
import { EmptyState, PageHeader } from "./ui";
import type { Pick } from "./Subjects";

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
};

export function StudyTimer({ pick }: { pick: Pick }) {
  const { user, subjects, update } = useStudy();
  const [subjectId, setSubjectId] = useState(pick?.subjectId ?? "");
  const [topic, setTopic] = useState(pick?.topic ?? "");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState(0);
  const [, setTick] = useState(0);
  const saving = useRef(false);

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const running = startedAt !== null;
  const elapsed = accumulated + (running ? Date.now() - startedAt : 0);
  const subject = subjects.find((s) => s.id === subjectId);
  const locked = running || accumulated > 0;

  const start = () => {
    if (!subjectId || !topic) { toast.error("Choose a subject and topic before starting."); return; }
    saving.current = false;
    setStartedAt(Date.now());
  };
  const pause = () => { if (startedAt !== null) { setAccumulated((a) => a + Date.now() - startedAt); setStartedAt(null); } };
  const reset = () => { setStartedAt(null); setAccumulated(0); };
  const finish = () => {
    if (saving.current) return;
    const seconds = Math.floor(elapsed / 1000);
    if (seconds < 1) { toast.error("Study for at least a second before finishing."); return; }
    saving.current = true;
    update((u) => ({ ...u, sessions: [{ id: uid(), subjectId, topic, seconds, endedAt: Date.now() }, ...u.sessions] }));
    toast.success(`Saved ${formatDuration(seconds)} of ${topic}. Nice work!`);
    reset();
  };

  if (!user) return null;
  return (
    <div>
      <PageHeader title="Study Timer" subtitle="Focus on one topic. Paused time is never counted." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card-soft p-6 sm:p-8 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Subject</label>
              <select className="field" disabled={locked} value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopic(""); }}>
                <option value="">Select a subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Topic</label>
              <select className="field" disabled={locked || !subject} value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">{subject ? "Select a topic" : "Choose a subject first"}</option>
                {subject?.topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="my-8 flex flex-col items-center">
            <div className={`grid h-56 w-56 place-items-center rounded-full border-8 sm:h-64 sm:w-64 ${running ? "border-primary shadow-glow" : "border-secondary"}`}>
              <div className="text-center">
                <p className="font-display text-4xl font-bold tabular-nums sm:text-5xl">{fmt(elapsed)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{running ? "Focusing…" : accumulated > 0 ? "Paused" : "Ready"}</p>
              </div>
            </div>
            {topic && <p className="mt-4 text-sm text-muted-foreground">{subject?.name} · <span className="font-semibold text-foreground">{topic}</span></p>}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {!running && accumulated === 0 && <button className="btn btn-primary" onClick={start}><Play className="h-4 w-4" /> Start</button>}
            {running && <button className="btn btn-soft" onClick={pause}><Pause className="h-4 w-4" /> Pause</button>}
            {!running && accumulated > 0 && <button className="btn btn-primary" onClick={start}><Play className="h-4 w-4" /> Resume</button>}
            <button className="btn btn-outline" onClick={reset} disabled={!locked}><RotateCcw className="h-4 w-4" /> Reset</button>
            <button className="btn btn-success" onClick={finish} disabled={!locked}><Flag className="h-4 w-4" /> Finish Study Session</button>
          </div>
        </div>

        <div className="card-soft p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Recent sessions</h2>
          {user.sessions.length === 0 ? <EmptyState icon={History} title="No sessions yet" text="Your finished study sessions will appear here." /> : (
            <ul className="divide-y divide-border">
              {user.sessions.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0"><p className="truncate font-medium">{s.topic}</p><p className="text-xs text-muted-foreground">{subjects.find((x) => x.id === s.subjectId)?.name ?? "Subject"} · {new Date(s.endedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</p></div>
                  <span className="shrink-0 font-semibold text-primary">{formatDuration(s.seconds)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
