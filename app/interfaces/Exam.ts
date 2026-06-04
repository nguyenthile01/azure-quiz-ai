import { Question } from "./Question";

export type ExamSummary = {
  id: string;
  totalScore: string;
  createdAt: string;
  completedAt: string | null;
  totalQuestions: number;
  answeredQuestions: number;
};

export type ExamQuestionRow = {
  id: string;
  questions: Question[];
};