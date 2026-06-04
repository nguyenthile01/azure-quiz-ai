"use client";

import { useMemo } from "react";
import type { Question } from "../interfaces/Question";

type QuestionCardProps = {
  question: Question;
  index: number;
  selectedKey?: {answer: string, value: string} | null;
  onSelect?: (index: number, key: string, optionText: string) => void;
  submitted?: boolean;
  timedOut?: boolean;
};

export default function QuestionCard({ question, index, selectedKey, onSelect, submitted, timedOut }: QuestionCardProps) {
  const selected = selectedKey ?? null;
  const disabled = useMemo(() => Boolean(submitted || timedOut), [submitted, timedOut]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm shadow-black/5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {index + 1}. {question.question}
        </h3>
        {question.difficulty ? (
          <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {question.difficulty}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {Object.entries(question.options).map(([key, opt], i) => {
          const isSelected = selected != null && opt === selected.value;
          const isWrong = submitted && selected != null && opt === selected.value && selected.answer !== question.correct_answer;

          return (
            <button
              key={`${index}-${i}-${opt}`}
              type="button"
              onClick={() => onSelect?.(index, key.toString(), opt)}
              disabled={disabled}
              className={[
                "w-full text-left rounded-lg border px-4 py-2 transition shadow-sm shadow-black/5",
                "focus-visible:outline-none focus-visible:ring-2",
                disabled ? "cursor-not-allowed opacity-70" : "",
                isSelected
                  ? "border-gray-500 bg-gray-100 text-gray-900 focus-visible:ring-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:focus-visible:ring-gray-700"
                  : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-600",
                isWrong ? "border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-300 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200 dark:focus-visible:ring-red-700/50" : "",
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
            <span className="text-gray-800 dark:text-gray-200">{question.correct_answer}</span>
          </div>
          {question.explanation ? (
            <div className="mt-2 text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Explanation:</span>{" "}
              <span>{question.explanation}</span>
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