import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

const MODES: Record<string, string> = {
  simple: "Explain simply, in plain beginner-friendly language with a relatable analogy.",
  steps: "Give a full step-by-step solution. For numerical problems use the headings: Given, Formula, Solution, Final Answer, Verification.",
  exam: "Write an exam-ready answer: well-structured, precise terminology, key points a marker looks for.",
  examples: "Explain with 2-3 clear, worked examples.",
  short: "Give a short, direct answer in a few sentences.",
  practice: "Give 3-5 practice questions of increasing difficulty on this, with answers hidden at the end under 'Answers'.",
};

function instructions(subject: string, topic: string, mode: string) {
  return `You are StudyMate's AI Study Tutor, a patient, accurate academic tutor for students.
Current subject: ${subject || "Any"}${topic ? `; topic: ${topic}` : ""}. The student may still ask about other subjects; answer them.
Response style: ${MODES[mode] ?? MODES['simple']}

Rules:
- Prioritise correctness, clarity and reasoning. Default to simple language for beginners.
- Maths/Statistics: identify the given information, choose the formula, solve step by step, check calculations, state the final answer clearly, state assumptions if ambiguous. Use LaTeX with $...$ inline and $$...$$ for display math.
- Python/Computer Science: give correct readable code in fenced code blocks, explain the logic, help find and fix errors, show example input/output.
- English: explain grammar and vocabulary, correct sentences and explain corrections, help with comprehension, writing and literature.
- Science: explain concepts accurately with simple examples and relevant equations; distinguish established facts from uncertainty.
- Never invent facts, formulas, sources or calculations. If unsure or the question is unclear, say so honestly and ask a clarifying question. Do not claim answers are guaranteed.
- Use earlier messages for follow-ups like "why?", "explain step 2", "another example".
- Use Markdown headings, lists and bold sparingly for readability.
- End every answer with a line "**Follow-up ideas:**" followed by exactly 3 short follow-up questions the student could ask, each as a "- " bullet.`;
}

export const Route = createFileRoute("/api/tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        let body: { messages?: UIMessage[]; subject?: string; topic?: string; mode?: string };
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
        const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];
        if (!messages.length) return Response.json({ error: "Please type a question." }, { status: 400 });
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          instructions(String(body.subject ?? "").slice(0, 60), String(body.topic ?? "").slice(0, 120), String(body.mode ?? "simple")),
        );
        return call.response();
      },
    },
  },
});
