"use client";

import { useMemo } from "react";
import type { Question } from "../interfaces/Question";

interface Props {
  q: Question;
  index: number;

  // global state (owned by Home)
  selectedKey: string | null;
  onSelect: (index: number, optionText: string) => void;

  // global lock/reveal (owned by Home)
  submitted: boolean;
  timedOut: boolean;
}

function getOptionKey(optionText: string): string {
  const m = optionText.trim().match(/^([A-D])(?:\s*[\.\)\-:])?\s*/i);
  return (m?.[1]?.toUpperCase() ?? optionText.trim().charAt(0).toUpperCase());
}

type OptionMap = { A: string; B: string; C: string; D: string };

function isOptionMap(v: unknown): v is OptionMap {
  return (
    typeof v === "object" &&
    v !== null &&
    "A" in v &&
    "B" in v &&
    "C" in v &&
    "D" in v
  );
}

function toOptionArray(options: unknown): string[] {
  if (Array.isArray(options)) return options.map(String);

  if (isOptionMap(options)) {
    // Normalize to the existing UI format: ["A. ...", "B. ...", ...]
    return [
      `A. ${String(options.A)}`,
      `B. ${String(options.B)}`,
      `C. ${String(options.C)}`,
      `D. ${String(options.D)}`,
    ];
  }

  return [];
}

export default function QuestionCard({
  q,
  index,
  selectedKey,
  onSelect,
  submitted,
  timedOut,
}: Props) {
  // Normalize options so options.map(...) always works
  const options = toOptionArray((q as Question as any).options);

  const locked = submitted || timedOut;

  const correctKey = useMemo(() => {
    return getOptionKey(String(q.correctAnswer ?? ""));
  }, [q.correctAnswer]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 border border-gray-200 text-[#0a0a0a]">
      <h3 className="text-lg  mb-2">
        {index + 1}. {q.question}
      </h3>

      <ul className="space-y-2 mb-4 mt-4">
        {options.map((opt, i) => {
          const key = getOptionKey(opt);
          const isSelected = selectedKey === key;

          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(index, opt)}
                disabled={submitted || timedOut}
                className={[
                  "w-full text-left px-4 py-2 rounded-lg border transition",
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {submitted && (
        <div className="mt-4 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Correct:</span> {q.correctAnswer}
          </div>
          <div className="mt-2">{q.explanation}</div>
        </div>
      )}
    </div>
  );
}