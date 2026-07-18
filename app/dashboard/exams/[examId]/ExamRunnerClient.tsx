"use client";

import { useMemo, useState } from "react";
import QuestionCard from "../../../components/QuestionCard";
import type { Question } from "@/app/interfaces/Question";
import { useAuth } from "@/app/lib/authContext";

export default function ExamRunnerClient({
  examId,
  items,
  isStartOver,
  startOver
}: {
  examId: string;
  items: Question[];
  isStartOver: boolean;
  startOver: (value: boolean) => void;
}) {
  const [selectedKeys, setSelectedKeys] = useState<Record<number, { answer: string; value: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);
  const { session } = useAuth();

  const answeredCount = useMemo(
    () => items.reduce((acc, _q, idx) => acc + (selectedKeys[idx]?.answer ? 1 : 0), 0),
    [items, selectedKeys],
  );

  const correctCount = useMemo(() => {
    if (!submitted) return 0;

    return items.reduce((acc, q, idx) => {
      const picked = selectedKeys[idx]?.answer; // ✅ guard: can be undefined
      if (!picked) return acc;

      // Compare using normalized keys
      const correct = q.correct_answer;
      return acc + (picked === correct ? 1 : 0);
    }, 0);
  }, [items, selectedKeys, submitted]);

  const onSelect = (questionIndex: number, optionKey: string, optionText: string) => {
    if (submitted) return;
    setSelectedKeys((prev) => ({ ...prev, [questionIndex]: { answer: optionKey, value: optionText } }));
  };

  const submitAll = async () => {
    if (submitted) return;
    if (items.length === 0) return;
    if (session?.user?.id == null) {
      setSaveError("User not authenticated.");
      return;
    }

    // compute score BEFORE setSubmitted(true) to avoid stale memo edge cases
    const computedCorrect = items.reduce((acc, q, idx) => {
      const picked = selectedKeys[idx]?.answer;
      if (!picked) return acc;
      return acc + (picked === q.correct_answer ? 1 : 0);
    }, 0);

    setSubmitted(true);
    setSaving(true);
    setSaveError(null);
    setSaveInfo(null);
    startOver(false);

    try {
      const scoreString = `${computedCorrect}/${items.length}`;

      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ examId, totalScore: scoreString, userId: session?.user?.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? `Failed to save: ${res.status}`);
      }

      setSaveInfo("Saved.");
    } catch (e) {
      setSaveError((e as Error)?.message ?? "Failed to save results.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {saveError ? (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {saveError}
        </div>
      ) : null}

      {saveInfo ? (
        <div className="mb-3 rounded border border-blue-200 bg-blue-50 p-2 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
          {saveInfo}
        </div>
      ) : null}

      <div className="mb-4 rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-200">
          <div>
            Answered: <span className="font-medium">{answeredCount}</span> / {items.length}
          </div>

          <div>
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 mx-4 text-white disabled:opacity-60"
              onClick={submitAll}
              disabled={saving || submitted}
            >
              {saving ? "Saving..." : submitted ? "Submitted" : "Submit all"}
            </button>
            <button
              type="button"
              className="rounded bg-gray-600 px-4 py-2 text-white disabled:opacity-60"
              onClick={() => {
                setSubmitted(false);
                setSelectedKeys({});
                setSaveError(null);
                setSaveInfo(null);
                startOver(true);
              }}
              disabled={isStartOver}
            >
              Start over
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            Result: <span className="font-medium">{correctCount}</span> / {items.length}
          </div>
        ) : null}
      </div>

      {items.map((q, i) => (
        <QuestionCard
          key={q.id ?? i}
          question={q}
          index={i}
          selectedKey={selectedKeys[i] ?? null}
          onSelect={onSelect}
          submitted={submitted}
          timedOut={false}
        />
      ))}
    </div>
  );
}