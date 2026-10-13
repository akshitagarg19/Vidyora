import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { AlertCircle, GraduationCap, Loader2, SendHorizontal, Square, Trash2 } from "lucide-react";
import { PageHeader } from "./ui";

const SUBJECTS = ["Mathematics", "Statistics", "English", "Python Programming", "Data Science", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "History", "Geography", "Other"];
const MODES = [
  { id: "simple", label: "Explain Simply" },
  { id: "steps", label: "Step-by-Step" },
  { id: "exam", label: "Exam-Ready" },
  { id: "examples", label: "With Examples" },
  { id: "short", label: "Short Answer" },
  { id: "practice", label: "Practice Questions" },
];
const SUGGESTIONS: Record<string, string[]> = {
  Mathematics: ["Solve 2x² − 8x + 6 = 0", "What is a derivative, simply?", "Find the area of a circle with radius 7 cm"],
  Statistics: ["Mean vs median — when to use which?", "Find the standard deviation of 2, 4, 4, 4, 5, 5, 7, 9", "What is a p-value?"],
  English: ["Correct: 'She don't like apples'", "Difference between affect and effect", "How do I write a strong essay intro?"],
  "Python Programming": ["Explain list comprehensions", "Why does my loop print None?", "Write a function to reverse a string"],
};
const DEFAULT_SUGGESTIONS = ["Explain this topic like I'm a beginner", "Give me a worked example", "What are common exam mistakes here?"];

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
function splitFollowUps(t: string) {
  const i = t.search(/\*\*Follow-up ideas:?\*\*/i);
  if (i < 0) return { body: t, ups: [] as string[] };
  const ups = t.slice(i).split("\n").filter((l) => /^\s*[-*]\s+/.test(l)).map((l) => l.replace(/^\s*[-*]\s+/, "").replace(/\$/g, "").trim()).filter(Boolean).slice(0, 3);
  return { body: t.slice(0, i).trim(), ups };
}

function Md({ text }: { text: string }) {
  return <div className="tutor-md"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{text}</ReactMarkdown></div>;
}

export function Tutor() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("simple");
  const [input, setInput] = useState("");
  const [warn, setWarn] = useState("");
  const opts = useRef({ subject, topic, mode });
  opts.current = { subject, topic, mode };
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/tutor", body: () => opts.current }), []);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, status]);
  useEffect(() => { if (!busy) taRef.current?.focus(); }, [busy]);

  const send = (q: string) => {
    const v = q.trim();
    if (!v) { setWarn("Please type a question first."); return; }
    if (busy) return;
    setWarn(""); clearError();
    sendMessage({ text: v });
    setInput("");
  };

  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role === "assistant" && !textOf(last));

  return (
    <div className="flex flex-col">
      <PageHeader title="AI Tutor" subtitle="Ask any academic question and learn step by step.">
        <button onClick={() => { stop(); setMessages([]); clearError(); }} disabled={!messages.length} className="btn btn-outline px-3 py-2 text-sm disabled:opacity-50">
          <Trash2 className="h-4 w-4" /> Clear chat
        </button>
      </PageHeader>

      <div className="card-soft mb-4 grid gap-3 p-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Subject
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2">
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Topic <span className="text-muted-foreground">(optional)</span>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} placeholder="e.g. Quadratic equations" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === m.id ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className="card-soft flex min-h-[420px] flex-col">
        <div className="max-h-[60vh] flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          <div className="flex gap-3">
            <Avatar />
            <div className="text-sm leading-relaxed"><p className="font-semibold">Hi! I'm your AI Study Tutor.</p><p>Ask me any question from any subject.</p><p>I'll help you understand the answer step by step!</p></div>
          </div>
          {!messages.length && (
            <div className="flex flex-wrap gap-2 pl-12">
              {(SUGGESTIONS[subject] ?? DEFAULT_SUGGESTIONS).map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs hover:bg-muted">{s}</button>
              ))}
            </div>
          )}
          {messages.map((m, idx) => {
            const t = textOf(m);
            if (m.role === "user") return <div key={m.id} className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-primary px-4 py-2.5 text-sm text-primary-foreground">{t}</div></div>;
            const { body, ups } = splitFollowUps(t);
            const isLast = idx === messages.length - 1;
            return (
              <div key={m.id} className="flex gap-3">
                <Avatar />
                <div className="min-w-0 flex-1 text-sm">
                  {t ? <Md text={body} /> : null}
                  {ups.length > 0 && !(isLast && busy) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ups.map((u) => <button key={u} onClick={() => send(u)} className="rounded-full bg-success-soft px-3 py-1.5 text-left text-xs font-medium text-success hover:opacity-80">{u}</button>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {waiting && <div className="flex items-center gap-3"><Avatar /><span className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</span></div>}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>The tutor couldn't answer right now. {/402|credit/i.test(error.message) ? "AI credits have run out for this workspace." : /429/.test(error.message) ? "Too many requests — please wait a moment and try again." : "Please try again."}</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3 sm:p-4">
          {warn && <p className="mb-2 text-xs text-destructive">{warn}</p>}
          <div className="flex items-end gap-2">
            <textarea ref={taRef} value={input} rows={2} maxLength={4000} autoFocus
              onChange={(e) => { setInput(e.target.value); if (warn) setWarn(""); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder={`Ask a ${subject} question… (Enter to send, Shift+Enter for new line)`} aria-label="Your question"
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {busy
              ? <button type="button" onClick={stop} aria-label="Stop" className="btn btn-outline h-[52px] w-[52px] justify-center p-0"><Square className="h-4 w-4" /></button>
              : <button type="submit" aria-label="Send" className="btn h-[52px] w-[52px] justify-center bg-gradient-primary p-0 text-primary-foreground"><SendHorizontal className="h-5 w-5" /></button>}
          </div>
        </form>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">AI answers can contain mistakes — double-check important results.</p>
    </div>
  );
}

function Avatar() {
  return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-success-soft text-success"><GraduationCap className="h-5 w-5" /></div>;
}
