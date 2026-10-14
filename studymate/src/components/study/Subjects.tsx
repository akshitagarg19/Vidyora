import { useState } from "react";
import { ArrowLeft, Brain, CheckCircle2, Circle, Clock, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { topicKey, uid, useStudy } from "@/lib/study/store";
import { QUESTION_BANK } from "@/lib/study/data";
import { PageHeader, ProgressBar, subjectIcon } from "./ui";
import type { Section } from "./AppShell";

export type Pick = { subjectId: string; topic: string } | null;

export function Subjects({ go, setPick }: { go: (s: Section) => void; setPick: (p: Pick) => void }) {
  const { user, update, subjects } = useStudy();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showOther, setShowOther] = useState(false);
  const [custom, setCustom] = useState("");
  const [err, setErr] = useState<string | null>(null);
  if (!user) return null;

  const addCustom = () => {
    const n = custom.trim().replace(/\s+/g, " ");
    if (n.length < 2 || n.length > 40) { setErr("Subject name should be 2–40 characters."); return; }
    if (subjects.some((s) => s.name.toLowerCase() === n.toLowerCase())) { setErr("You already have that subject."); return; }
    update((u) => ({ ...u, customSubjects: [...u.customSubjects, { id: `custom-${uid()}`, name: n }] }));
    toast.success(`${n} added to your subjects`);
    setCustom(""); setShowOther(false); setErr(null);
  };

  const subject = subjects.find((s) => s.id === openId);
  if (subject) {
    const Icon = subjectIcon(subject.id);
    const done = subject.topics.filter((t) => user.completedTopics[topicKey(subject.id, t)]).length;
    const complete = (t: string) => {
      const k = topicKey(subject.id, t);
      if (user.completedTopics[k]) { toast.info("This topic is already completed."); return; }
      update((u) => (u.completedTopics[k] ? u : { ...u, completedTopics: { ...u.completedTopics, [k]: Date.now() } }));
      toast.success(`"${t}" marked as completed`);
    };
    return (
      <div className="animate-rise space-y-6">
        <button className="btn btn-outline" onClick={() => { setOpenId(null); setSelected(null); }}><ArrowLeft className="h-4 w-4" /> All subjects</button>
        <div className="card-soft flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><Icon className="h-7 w-7" /></div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{subject.name}</h1>
            <p className="text-muted-foreground">{subject.description}</p>
          </div>
          <div className="w-full sm:w-56"><p className="mb-1.5 text-sm text-muted-foreground">{done}/{subject.topics.length} topics · {Math.round((done / subject.topics.length) * 100)}%</p><ProgressBar value={(done / subject.topics.length) * 100} tone="success" /></div>
        </div>
        <div className="grid gap-3">
          {subject.topics.map((t) => {
            const isDone = !!user.completedTopics[topicKey(subject.id, t)];
            const isSel = selected === t;
            const hasQuiz = !!QUESTION_BANK[subject.id]?.[t];
            return (
              <div key={t} className={`card-soft p-4 transition-colors ${isSel ? "ring-2 ring-ring" : ""}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setSelected(isSel ? null : t)}>
                    {isDone ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                    <span className="font-semibold">{t}</span>
                    {isDone && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">Completed</span>}
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-soft px-3 py-2 text-sm" onClick={() => setSelected(isSel ? null : t)}>{isSel ? "Selected" : "Select Topic"}</button>
                    <button className="btn btn-success px-3 py-2 text-sm" disabled={isDone} onClick={() => complete(t)}>{isDone ? "Completed" : "Mark as Completed"}</button>
                  </div>
                </div>
                {isSel && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <p className="w-full text-sm text-muted-foreground">How would you like to study {t}?</p>
                    <button className="btn btn-primary px-3 py-2 text-sm" onClick={() => { setPick({ subjectId: subject.id, topic: t }); go("timer"); }}><Clock className="h-4 w-4" /> Study with timer</button>
                    <button className="btn btn-outline px-3 py-2 text-sm" disabled={!hasQuiz} onClick={() => { setPick({ subjectId: subject.id, topic: t }); go("quiz"); }}><Brain className="h-4 w-4" /> {hasQuiz ? "Practice quiz" : "Quiz not available yet"}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Subjects" subtitle="Pick a subject to explore its topics and track your progress." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((s) => {
          const Icon = subjectIcon(s.id);
          const done = s.topics.filter((t) => user.completedTopics[topicKey(s.id, t)]).length;
          const pct = Math.round((done / s.topics.length) * 100);
          return (
            <div key={s.id} className="card-soft hover-lift animate-rise flex flex-col p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="h-6 w-6" /></div>
                {s.custom && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">Custom</span>}
              </div>
              <h3 className="text-lg font-bold">{s.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex justify-between text-sm"><span className="text-muted-foreground">{done} of {s.topics.length} topics studied</span><span className="font-semibold">{pct}%</span></div>
              <div className="mt-2"><ProgressBar value={pct} tone="success" /></div>
              <button className="btn btn-primary mt-5" onClick={() => setOpenId(s.id)}>Open Subject</button>
            </div>
          );
        })}
        <div className="flex flex-col rounded-[calc(var(--radius)+4px)] border-2 border-dashed border-border bg-card/60 p-5">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-success-soft text-success"><Sparkles className="h-6 w-6" /></div>
          <h3 className="text-lg font-bold">Other</h3>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">Studying something else? Add your own subject.</p>
          {showOther ? (
            <div className="mt-4 space-y-2">
              <input autoFocus className="field" placeholder="e.g. Physics" value={custom} maxLength={40} onChange={(e) => { setCustom(e.target.value); setErr(null); }} onKeyDown={(e) => e.key === "Enter" && addCustom()} />
              {err && <p className="text-sm text-destructive">{err}</p>}
              <div className="flex gap-2"><button className="btn btn-success flex-1" onClick={addCustom}>Add Subject</button><button className="btn btn-outline" onClick={() => { setShowOther(false); setErr(null); }}>Cancel</button></div>
            </div>
          ) : (
            <button className="btn btn-soft mt-5" onClick={() => setShowOther(true)}><Plus className="h-4 w-4" /> Add Custom Subject</button>
          )}
        </div>
      </div>
    </div>
  );
}
