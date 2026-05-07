export interface Question {
  question: string;

  // Accept both old and new shapes
  options: string[] | { A: string; B: string; C: string; D: string };

  correctAnswer: string;
  explanation: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}