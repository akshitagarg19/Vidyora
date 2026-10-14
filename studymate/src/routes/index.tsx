import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StudyProvider, useStudy } from "@/lib/study/store";
import { Welcome } from "@/components/study/Welcome";
import { AppShell, type Section } from "@/components/study/AppShell";
import { Dashboard, Profile, Progress } from "@/components/study/Overview";
import { Subjects, type Pick } from "@/components/study/Subjects";
import { Quiz } from "@/components/study/Quiz";
import { StudyTimer } from "@/components/study/Timer";
import { Tutor } from "@/components/study/Tutor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyMate — Your Personal AI Study Companion" },
      { name: "description", content: "Learn smarter, stay consistent, and achieve your goals with subjects, quizzes, a study timer and progress tracking." },
      { property: "og:title", content: "StudyMate — Your Personal AI Study Companion" },
      { property: "og:description", content: "Track study time, practice quizzes and progress across subjects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function App() {
  const { user, ready } = useStudy();
  const [section, setSection] = useState<Section>("dashboard");
  const [pick, setPick] = useState<Pick>(null);
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!user) return <Welcome />;
  const go = (s: Section) => { setSection(s); window.scrollTo({ top: 0 }); };
  return (
    <AppShell section={section} go={(s) => { setPick(null); go(s); }}>
      <div key={section + (pick ? pick.topic : "")}>
        {section === "dashboard" && <Dashboard go={go} />}
        {section === "subjects" && <Subjects go={go} setPick={setPick} />}
        {section === "quiz" && <Quiz go={go} pick={pick} />}
        {section === "timer" && <StudyTimer pick={pick} />}
        {section === "tutor" && <Tutor />}
        {section === "progress" && <Progress />}
        {section === "profile" && <Profile />}
      </div>
    </AppShell>
  );
}

function Index() {
  return (
    <StudyProvider>
      <App />
    </StudyProvider>
  );
}
