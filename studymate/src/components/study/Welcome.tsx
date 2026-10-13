import { useState, type FormEvent } from "react";
import { ArrowRight, Brain, GraduationCap, Timer, Trophy } from "lucide-react";
import { useStudy, validateName } from "@/lib/study/store";
import heroImg from "@/assets/study-hero.jpg";

export function Welcome() {
  const { login } = useStudy();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateName(name);
    setError(err);
    if (!err) login(name);
  };

  return (
    <main className="bg-hero min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2">
        <div className="animate-rise">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-soft">
            <GraduationCap className="h-4 w-4" /> StudyMate AI
          </div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Your Personal <span className="bg-gradient-primary bg-clip-text text-transparent">AI Study Companion</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Learn smarter, stay consistent, and achieve your goals.</p>

          <form onSubmit={submit} className="mt-8 max-w-md" noValidate>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold">What should we call you?</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input id="name" className="field" placeholder="Enter your name" value={name} maxLength={40}
                onChange={(e) => { setName(e.target.value); if (error) setError(null); }} aria-invalid={!!error} />
              <button type="submit" className="btn btn-primary shrink-0">Get Started <ArrowRight className="h-4 w-4" /></button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <p className="mt-3 text-xs text-muted-foreground">No email or password needed. Your progress is saved on this device under your name.</p>
          </form>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[{ i: Brain, t: "Practice quizzes" }, { i: Timer, t: "Focus timer" }, { i: Trophy, t: "Track progress" }].map(({ i: I, t }) => (
              <div key={t} className="card-soft p-3 text-center">
                <I className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1.5 text-xs font-medium">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-rise hidden lg:block">
          <img src={heroImg} alt="Student studying with a friendly AI companion" width={1024} height={1024} className="w-full rounded-[2rem] shadow-glow" />
        </div>
      </div>
    </main>
  );
}
