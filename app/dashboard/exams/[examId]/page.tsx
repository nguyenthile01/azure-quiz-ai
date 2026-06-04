"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import ExamRunnerClient from "./ExamRunnerClient";
import type { ExamSummary } from "@/app/interfaces/Exam";
import { Question } from "@/app/interfaces/Question";

export default function ExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = React.use(params);

  const [examDetails, setExamDetails] = useState<{ summary: ExamSummary | null; items: Question[] } | null>({
    summary: null,
    items: [],
  });

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
      </div>

      <ExamRunnerClient examId={examDetails.summary.id} items={examDetails.items} />
    </main>
  );
}