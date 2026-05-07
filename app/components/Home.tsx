"use client";

import { useEffect, useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Question } from "../interfaces/Question";
import { TEST_TYPES, type DifficultyMix, type TestType } from "../lib/prompt";

function getOptionKey(optionText: string): string {
  const m = optionText.trim().match(/^([A-D])(?:\s*[\.\)\-:])?\s*/i);
  return (m?.[1]?.toUpperCase() ?? optionText.trim().charAt(0).toUpperCase());
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export default function HomeClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // New: test settings
  const [testType, setTestType] = useState<TestType>(TEST_TYPES[0]);
  const [count, setCount] = useState<number>(30);
  const [difficultyMix, setDifficultyMix] = useState<DifficultyMix>({ Easy: 34, Medium: 33, Hard: 33 });
  const difficultyTotal = difficultyMix.Easy + difficultyMix.Medium + difficultyMix.Hard;
  const difficultyValid = difficultyTotal === 100;

  // Global answer state for ALL questions
  const [selectedKeys, setSelectedKeys] = useState<Record<number, string | null>>({});
  const [submitted, setSubmitted] = useState(false);

  // Global timer state for ALL questions (INPUT IN MINUTES)
  const [timerMinutesInput, setTimerMinutesInput] = useState<number>(1);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const locked = submitted || timedOut;

  const handleGenerate = async () => {
    if (!difficultyValid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          difficultyMix,
          count,
        }),
      });

      if (!res.ok) {
        throw new Error(`Generate failed: ${res.status}`);
      }

      const data = (await res.json()) as { items?: Question[] };
      setQuestions(data.items ?? []);

      // reset global UI state whenever new test is generated
      setSelectedKeys({});
      setSubmitted(false);
      setSecondsLeft(null);
      setTimedOut(false);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (questionIndex: number, optionText: string) => {
    if (locked) return;
    const key = getOptionKey(optionText);
    setSelectedKeys((prev) => ({ ...prev, [questionIndex]: key }));
  };

  const answeredCount = useMemo(() => {
    return questions.reduce((acc, _, idx) => acc + (selectedKeys[idx] ? 1 : 0), 0);
  }, [questions, selectedKeys]);

  const startTimer = () => {
    const minutes = Number(timerMinutesInput);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setSecondsLeft(null);
      setTimedOut(false);
      return;
    }
    setSecondsLeft(Math.floor(minutes * 60));
    setTimedOut(false);
  };

  const resetAll = () => {
    setSelectedKeys({});
    setSubmitted(false);
    setTimedOut(false);
    setSecondsLeft(null);
  };

  const submitAll = () => {
    if (locked) return;
    if (questions.length === 0) return;
    setSubmitted(true);
  };

  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0) {
      setSecondsLeft(0);
      setTimedOut(true);
      setSubmitted(true); // reveal answers + explanation for all
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const timeLabel = useMemo(() => {
    if (secondsLeft === null) return "Timer: not started";
    const mm = Math.floor(secondsLeft / 60);
    const ss = secondsLeft % 60;
    return `Time left: ${mm}:${String(ss).padStart(2, "0")}`;
  }, [secondsLeft]);

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">AzurePrep AI</h1>
      <p className="text-center text-gray-600 mb-8">Generate AI-powered Azure Fundamentals practice tests.</p>

      {/* New: Test configuration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 text-[#0a0a0a]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700">
            Test type
            <select
              className="mt-1 w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
              value={testType}
              onChange={(e) => setTestType(e.target.value as TestType)}
              disabled={loading}
            >
              {TEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700">
            Number of questions
            <input
              readOnly
              type="number"
              min={1}
              max={50}
              step={1}
              className="mt-1 w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
              value={count}
              onChange={(e) => setCount(clampInt(Number(e.target.value), 1, 50))}
              disabled={loading}
            />
          </label>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-2">Difficulty mix (must sum to 100%)</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500 text-center">
                Easy <span className="text-gray-800">({difficultyMix.Easy}%)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={difficultyMix.Easy}
                onChange={(e) =>
                  setDifficultyMix((prev) => ({ ...prev, Easy: clampInt(Number(e.target.value), 0, 100) }))
                }
                className="mt-1 w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer"
                disabled={loading}
              />
            </div>

            <div>
              <div className="text-xs text-gray-500 text-center">
                Medium <span className="text-gray-800">({difficultyMix.Medium}%)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={difficultyMix.Medium}
                onChange={(e) =>
                  setDifficultyMix((prev) => ({ ...prev, Medium: clampInt(Number(e.target.value), 0, 100) }))
                }
                className="mt-1 w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer"
                disabled={loading}
              />
            </div>

            <div>
              <div className="text-xs text-gray-500 text-center">
                Hard <span className="text-gray-800">({difficultyMix.Hard}%)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={difficultyMix.Hard}
                onChange={(e) =>
                  setDifficultyMix((prev) => ({ ...prev, Hard: clampInt(Number(e.target.value), 0, 100) }))
                }
                className="mt-1 w-full h-2 bg-gray-200 rounded-md appearance-none cursor-pointer"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-2 text-sm">
            <span className={difficultyValid ? "text-green-700" : "text-red-600"}>
              Total: {difficultyTotal}%{difficultyValid ? "" : " (must be 100%)"}
            </span>
          </div>

          {!difficultyValid && (
            <div className="mt-2 text-sm text-red-600">
              Difficulty mix must sum to 100%.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleGenerate}
          disabled={loading || !difficultyValid}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {loading ? "Generating..." : "Generate Test"}
        </button>
      </div>

      {/* Global timer + submit controls (used for all questions) */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600">
                Answered: <span className="">{answeredCount}</span> /{" "}
                <span className="">{questions.length}</span>
              </div>

              <div className="mt-1 text-sm">
                <span className={secondsLeft !== null && secondsLeft <= 10 ? "text-red-600 " : "text-gray-700"}>
                  {timeLabel}
                </span>
                {timedOut && <span className="ml-2 text-red-700 ">Time out</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[#0a0a0a]">
              <label className="text-sm text-gray-600">
                Minutes:
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="ml-2 w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                  value={timerMinutesInput}
                  onChange={(e) => setTimerMinutesInput(Number(e.target.value))}
                  disabled={secondsLeft !== null && !locked}
                />
              </label>

              <button
                className="text-[#0a0a0a] px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                onClick={startTimer}
                disabled={locked}
                type="button"
              >
                Start timer
              </button>

              <button
                type="button"
                onClick={submitAll}
                disabled={locked}
                className="text-[#0a0a0a] px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
              >
                Submit all
              </button>

              <button
                className="text-[#0a0a0a] px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                onClick={resetAll}
                type="button"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length > 0 &&
        questions.map((q, i) => (
          <QuestionCard
            key={i}
            q={q}
            index={i}
            selectedKey={selectedKeys[i] ?? null}
            onSelect={onSelect}
            submitted={submitted}
            timedOut={timedOut}
          />
        ))}
    </main>
  );
}