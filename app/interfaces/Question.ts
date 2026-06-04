export interface Question {
  id: string;
  question: string;
  // Accept both old and new shapes
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
  exam_id: string;
  user_id: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  created_at?: string;
}