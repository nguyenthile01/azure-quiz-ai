"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeaderAuth from "../components/HeaderAuth";
import AuthDialog from "../components/AuthDialog";
import GenerateComponent from "../components/GenerateComponent";
import { useAuth } from "../lib/authContext";
import { ExamSummary } from "../interfaces/Exam";
import { Category } from "../interfaces/Category";

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const { session, loading, refreshSession } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [testTypes, setTestTypes] = useState<string[]>([]);

  // Check if we just came back from OAuth
  useEffect(() => {
    function checkOAuth() {
      const error = searchParams.get("error");
      if (error) {
        setAuthOpen(true);
      } else {
        // Refresh session on mount to catch OAuth redirect.
        // A slight delay can help ensure the cookie is set before refreshing.
        const timer = setTimeout(() => {
          refreshSession();
        }, 100);
        return () => {
          clearTimeout(timer);
        };
      }
    }
    checkOAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    function inital() {
      if (!loading && !session) {
        setAuthOpen(true);
      }
    }
    inital();
  }, [session, loading]);

  useEffect(() => {
    async function loadExams() {
      if (!session) return;

      try {
        const res = await fetch("/api/exams/get-exam-summaries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ user: session.user }),
        });

        const data = await res.json();
        if (res.ok) {
          setExams(data.items);
        } else {
          console.error("Failed to load exams:", data.error);
        }
      } catch (err) {
        console.error("Error loading exams:", err);
      }
    }

    loadExams();
  }, [session]);

  useEffect(() => {
    async function getTestTypes() {
      if (!session) return;
      try {
        const response = await fetch(`/api/categories`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const categories: Category[] = await response.json();
        setTestTypes(categories.map((item) => item.exam_name));
      } catch (error) {
        console.error("Failed to fetch test types:", error);
        // Fallback to an empty list or handle the error as needed
        setTestTypes([]);
      }
    }
    getTestTypes();
  }, [session]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <main className="mx-auto w-full max-w-5xl p-6">
        <HeaderAuth onOpenAuth={() => setAuthOpen(true)} />
        <h1 className="text-4xl font-bold text-center mb-4 px-4 py-6">AzurePrep AI</h1>
        <p className="text-center text-gray-600 mb-8">Generate AI-powered Azure Fundamentals practice tests.</p>
        <GenerateComponent setAuthOpen={setAuthOpen} exams={exams} testTypes={testTypes} />
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Your Progress</h1>
        </div>

        {exams.length === 0 ? (
          <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            No exams found yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => {
                  const pct = e.totalQuestions > 0 ? Math.round((e.answeredQuestions / e.totalQuestions) * 100) : 0;

                  return (
                    <tr key={e.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/exams/${e.id}`}
                          className="font-medium text-gray-900 hover:underline dark:text-gray-50"
                        >
                          {e.id.slice(0, 8)}…
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
                            <div className="h-full bg-gray-900 dark:bg-gray-100" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">
                            {e.answeredQuestions}/{e.totalQuestions} ({pct}%)
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{e.totalScore}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{formatDate(e.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{formatDate(e.completedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}