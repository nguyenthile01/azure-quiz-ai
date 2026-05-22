"use client";

import { useMemo } from "react";
import type { Question } from "../interfaces/Question";

type QuestionCardProps = {
  q: Question;
  index: number;
  selectedKey?: string | null;
  onSelect?: (index: number, optionText: string) => void;
  submitted?: boolean;
  timedOut?: boolean;
};

type QuestionWithExtras = Question & {
  options?: unknown;
  difficulty?: string;
};

function getOptionKey(optionText: string): string {
  return optionText.trim().toLowerCase();
}

function isOptionMap(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toOptionArray(options: unknown): string[] {
  if (Array.isArray(options)) return options.filter((v): v is string => typeof v === "string");
  if (isOptionMap(options)) return Object.values(options);
  return [];
}

export default function QuestionCard({ q, index, selectedKey, onSelect, submitted, timedOut }: QuestionCardProps) {
  const qx: QuestionWithExtras = q;

  const options = useMemo(() => toOptionArray(qx.options), [qx.options]);
  const selected = selectedKey ?? null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm shadow-black/5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {index + 1}. {q.question}
        </h3>
        {qx.difficulty ? (
          <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {qx.difficulty}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {options.map((opt, i) => {
          const key = getOptionKey(opt);
          const isSelected = selected != null && key === selected;
          const disabled = Boolean(submitted || timedOut);

          return (
            <button
              key={`${index}-${i}-${key}`}
              type="button"
              onClick={() => onSelect?.(index, opt)}
              disabled={disabled}
              className={[
                "w-full text-left rounded-lg border px-4 py-2 transition shadow-sm shadow-black/5",
                "focus-visible:outline-none focus-visible:ring-2",
                disabled ? "cursor-not-allowed opacity-70" : "",
                isSelected
                  ? "border-gray-900 bg-gray-100 text-gray-900 focus-visible:ring-gray-300 dark:border-gray-100 dark:bg-gray-800 dark:text-gray-50 dark:focus-visible:ring-gray-600"
                  : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-600",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Correct:</span>{" "}
            <span className="text-gray-800 dark:text-gray-200">{q.correct_answer}</span>
          </div>
          {q.explanation ? (
            <div className="mt-2 text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Explanation:</span>{" "}
              <span>{q.explanation}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {timedOut && !submitted ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          Time is up. Submit to review the correct answers.
        </div>
      ) : null}
    </div>
  );
}