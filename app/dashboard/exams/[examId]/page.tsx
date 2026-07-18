"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ExamRunnerClient from "./ExamRunnerClient";
import type { ExamSummary } from "@/app/interfaces/Exam";
import { Question } from "@/app/interfaces/Question";

const DEFAULT_DURATION_MINUTES = 60;

export default function ExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = React.use(params);
  const [isStartOver, setIsStartOver] = useState(false);
  // State for user input in minutes
  const [durationInMinutes, setDurationInMinutes] = useState(DEFAULT_DURATION_MINUTES);
  // State for the countdown timer in seconds
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(DEFAULT_DURATION_MINUTES * 60);

  const [examDetails, setExamDetails] = useState<{ summary: ExamSummary | null; items: Question[] } | null>({
    summary: null,
    items: [],
  });

  // Timer effect
  useEffect(() => {
    // Only run the timer if the exam has started and there's time left
    if (!isStartOver || timeLeftInSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftInSeconds((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup function to clear the interval
    return () => clearInterval(timer);
  }, [isStartOver, timeLeftInSeconds]);

  // Function to format total seconds into MM:SS format
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Memoize the formatted time display
  const timerDisplay = useMemo(() => formatTime(timeLeftInSeconds), [timeLeftInSeconds]);

  // Effect to load exam details
  useEffect(() => {
    async function loadExam() {
      try {
        const examRes = await fetch(`/api/exams/${encodeURIComponent(examId)}`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" }
        }).then(async (res) => {
          if (!res.ok) {
            if (res.status === 404) throw new Error("Exam not found");
            if (res.status === 403) throw new Error("You don't have access to this exam");
            throw new Error(`Failed to load exam: ${res.status} ${res.statusText}`);
          }
          return res.json();
        });
        setExamDetails({
          summary: examRes.summary,
          items: examRes.items,
        });
      } catch (error) {
        setExamDetails(null);
        console.error("Error loading exam details:", error);
      }
    }

    loadExam();
  }, [examId]);

  const handleStartOver = (start: boolean) => {
    setIsStartOver(start);
    if (start) {
      // When starting, convert the user-defined minutes to seconds
      setTimeLeftInSeconds(durationInMinutes * 60);
    }
  };

  if (!examDetails || !examDetails.summary) {
    return (
      <main className="mx-auto w-full max-w-5xl p-6">
        <Link href="/dashboard" className="text-sm text-gray-700 hover:underline dark:text-gray-200">
          ← Back to dashboard
        </Link>
        <div className="mt-4 rounded border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          Exam not found or you don’t have access.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-gray-700 hover:underline dark:text-gray-200">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Exam {examDetails.summary.id.slice(0, 8)}…
        </h1>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isStartOver ? (
            <div>
              Time left: <span className="font-medium">{timerDisplay}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Set duration (minutes):</span>
              <input
                type="number"
                value={durationInMinutes}
                onChange={(e) => setDurationInMinutes(Math.max(1, Number(e.target.value)))}
                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      <ExamRunnerClient examId={examDetails.summary.id} items={examDetails.items} isStartOver={isStartOver} startOver={handleStartOver} />
    </main>
  );
}