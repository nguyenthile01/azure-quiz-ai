"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_TYPES, type DifficultyMix, type TestType } from "../lib/prompt";
import type { Question } from "../interfaces/Question";
import { ExamSummary } from "../interfaces/Exam";
import { useAuth } from "../lib/authContext";

const MAXEXAMS = 2;

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export default function GenerateComponent({ exams, testTypes, setAuthOpen }: { exams: ExamSummary[]; testTypes: string[]; setAuthOpen: (open: boolean) => void }) {
  const router = useRouter();
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const { session } = useAuth();

  const recentExams = useMemo(() => {
    return exams
      .filter((e) => {
        const created = new Date(e.createdAt);
        return created.getFullYear() === currentYear && created.getMonth() === currentMonth;
      });
  }, [exams, currentMonth, currentYear]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // settings
  const [testType, setTestType] = useState<TestType>(TEST_TYPES[0]);
  const [count, setCount] = useState<number>(20);
  const [difficultyMix, setDifficultyMix] = useState<DifficultyMix>({ Easy: 34, Medium: 33, Hard: 33 });

  const difficultyTotal = difficultyMix.Easy + difficultyMix.Medium + difficultyMix.Hard;
  const difficultyValid = difficultyTotal === 100;

  const handleGenerate = async () => {
    if (!difficultyValid) return;
    setError(null);

    if (recentExams.length >= MAXEXAMS) {
      setError(`You have already generated ${recentExams.length} exam(s) this month. Please register an premium account to generate more exams and access additional features.`);
      return;
    }

    const user = session?.user;
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setLoading(true);
    try {
      const items = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ testType, count, difficultyMix }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to generate exam: ${res.status}`);
          return res.json();
        })
        .then((data) => data.items as Question[]);

      if (items.length === 0) throw new Error("No questions returned.");
      const examRes = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin", // 👈 Automatically grabs cookie string securely
        body: JSON.stringify({ items, user }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to create exam: ${res.status}`);
        }
        return res.json();
      });
      router.push(`/dashboard/exams/${examRes.exam.id}`);
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to generate exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="mx-auto max-w-5xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 text-[#0a0a0a]">
          {error ? (
            <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              Test type
              <select
                className="mt-1 w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestType)}
                disabled={loading}
              >
                {testTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-gray-700">
              Number of questions
              <input
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

            {!difficultyValid && <div className="mt-2 text-sm text-red-600">Difficulty mix must sum to 100%.</div>}
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
      </main>
    </div>
  );
}