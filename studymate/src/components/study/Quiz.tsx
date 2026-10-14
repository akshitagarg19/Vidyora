import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Home, ListChecks, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ALL_TOPICS, getQuestions, shuffle, type Question } from "@/lib/study/data";
import { uid, useStudy } from "@/lib/study/store";
import { PageHeader, ProgressBar } from "./ui";
import type { Section } from "./AppShell";
import type { Pick } from "./Subjects";

type Phase = "setup" | "play" | "result" | "review";

export function Quiz({ go, pick }: { go: (s: Section) => void; pick: Pick }) {
  const { subjects, update } = useStudy();
  const [subjectId, setSubjectId] = useState(pick?.subjectId ?? "");
  const [topic, setTopic] = useState(pick?.topic ?? "");
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<Phase>("setup");
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const savedRun = useRef<string | null>(null);
  const runId = useRef("");

  const subject = subjects.find((s) => s.id === subjectId);
  const available = subjectId && topic ? getQuestions(subjectId, topic) : [];
  const unsupported = !!subjectId && !!topic && available.length === 0;
  const topicLabel = topic === ALL_TOPICS ? "All topics" : topic;

  useEffect(() => { if (available.length && count > available.length) setCount([5, 10, 15].filter((c) => c <= available.length).pop() ?? 5); }, [available.length, count]);

  const start = () => {
    if (!subjectId || !topic) { toast.error("Please choose a subject and topic."); return; }
    if (!available.length) return;
    const n = Math.min(count, available.length);
    setQs(shuffle(available).slice(0, n));
    setAnswers(Array(n).fill(null));
    setIdx(0);
    runId.current = uid();
    setPhase("play");
  };

  const finish = () => {
    const correct = qs.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    if (savedRun.current !== runId.current) {
      savedRun.current = runId.current;
      update((u) => ({ ...u, quizzes: [{ id: runId.current, subjectId, topic: topicLabel, total: qs.length, correct, at: Date.now() }, ...u.quizzes] }));
    }
    setPhase("result");
  };

  if (phase === "play") {
    const q = qs[idx];
    if (!q) return null;
    const last = idx === qs.length - 1;
    return (
      <div className="mx-auto max-w-2xl animate-rise">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground"><span>{subject?.name} · {topicLabel}</span><span className="font-semibold text-foreground">Question {idx + 1} of {qs.length}</span></div>
        <ProgressBar value={((idx + 1) / qs.length) * 100} />
        <div className="card-soft mt-6 p-6 sm:p-8">
          <h2 className="text-xl font-bold">{q.q}</h2>
          <div className="mt-6 grid gap-3">
            {q.options.map((o, i) => {
              const sel = answers[idx] === i;
              return (
                <button key={i} onClick={() => setAnswers((a) => a.map((v, j) => (j === idx ? i : v)))}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left font-medium transition-colors ${sel ? "border-primary bg-secondary text-secondary-foreground" : "border-border hover:border-ring hover:bg-muted"}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${sel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{"ABCD"[i]}</span>{o}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn btn-primary" disabled={answers[idx] === null} onClick={() => (last ? finish() : setIdx(idx + 1))}>
              {last ? "Submit Quiz" : "Next Question"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" || phase === "review") {
    const correct = qs.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    const pct = Math.round((correct / qs.length) * 100);
    const feedback = pct >= 90 ? "Outstanding! You've mastered this topic. 🌟" : pct >= 70 ? "Great job! You're getting really strong here. 💪" : pct >= 50 ? "Good effort! A little more practice and you'll nail it." : "Every expert started somewhere. Review and try again — you've got this!";
    return (
      <div className="mx-auto max-w-2xl animate-rise space-y-6">
        <div className="card-soft p-6 text-center sm:p-8">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-primary font-display text-3xl font-bold text-primary-foreground shadow-glow">{pct}%</div>
          <h1 className="mt-4 text-2xl font-bold">Quiz complete!</h1>
          <p className="mt-1 text-muted-foreground">{feedback}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Total", qs.length], ["Correct", correct], ["Incorrect", qs.length - correct], ["Score", `${correct}/${qs.length}`]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-display text-xl font-bold">{v}</p></div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button className="btn btn-soft" onClick={() => setPhase(phase === "review" ? "result" : "review")}><ListChecks className="h-4 w-4" /> {phase === "review" ? "Hide Review" : "Review Answers"}</button>
            <button className="btn btn-primary" onClick={start}><RotateCcw className="h-4 w-4" /> Try Again</button>
            <button className="btn btn-outline" onClick={() => go("dashboard")}><Home className="h-4 w-4" /> Back to Dashboard</button>
          </div>
          <button className="mt-3 text-sm font-medium text-primary hover:underline" onClick={() => setPhase("setup")}>Choose a different quiz</button>
        </div>
        {phase === "review" && (
          <div className="space-y-3">
            {qs.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <div key={i} className="card-soft p-5">
                  <div className="flex items-start gap-3">
                    {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />}
                    <div className="text-sm">
                      <p className="font-semibold">{i + 1}. {q.q}</p>
                      <p className="mt-2">Your answer: <span className={ok ? "font-semibold text-success" : "font-semibold text-destructive"}>{answers[i] !== null ? q.options[answers[i]!] : "—"}</span></p>
                      {!ok && <p>Correct answer: <span className="font-semibold text-success">{q.options[q.answer]}</span></p>}
                      <p className={`mt-1 text-xs font-semibold ${ok ? "text-success" : "text-destructive"}`}>{ok ? "Correct" : "Incorrect"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Practice Quiz" subtitle="Test yourself with questions that match exactly what you're studying." />
      <div className="card-soft mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">1. Subject</label>
          <select className="field" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopic(""); }}>
            <option value="">Select a subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">2. Topic</label>
          <select className="field" value={topic} disabled={!subject} onChange={(e) => setTopic(e.target.value)}>
            <option value="">{subject ? "Select a topic" : "Choose a subject first"}</option>
            {subject && getQuestions(subject.id, ALL_TOPICS).length > 0 && <option value={ALL_TOPICS}>All topics (mixed {subject.name})</option>}
            {subject?.topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {unsupported ? (
          <div className="flex gap-3 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Quiz questions are not available for <b>{topicLabel}</b> in {subject?.name} yet. Please choose another topic or a supported subject (Mathematics, English, Statistics, Python Programming, Data Science).</p>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-semibold">3. Number of questions</label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((c) => {
                const dis = !!topic && available.length < c;
                return (
                  <button key={c} disabled={dis} onClick={() => setCount(c)} title={dis ? `Only ${available.length} questions for this topic — try "All topics"` : undefined}
                    className={`btn ${count === c ? "btn-primary" : "btn-outline"}`}>{c}</button>
                );
              })}
            </div>
            {topic && available.length < 15 && <p className="mt-2 text-xs text-muted-foreground">This topic has {available.length} questions. Pick "All topics" for longer quizzes.</p>}
          </div>
        )}
        <button className="btn btn-primary w-full" disabled={!subjectId || !topic || unsupported} onClick={start}>Start Quiz <ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
