export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type DifficultyMix = Record<DifficultyLevel, number>;

export const TEST_TYPES = [
  "Exam AI-900: Microsoft Azure AI Fundamentals",
  "Microsoft Certified: Azure AI Fundamentals",
  "Exam AI-901: Microsoft Azure AI Fundamentals (beta)",
  "Exam AZ-900: Microsoft Azure Fundamentals",
  "Microsoft Certified: Azure Fundamentals",
  "Exam AZ-104: Microsoft Azure Administrator",
  "Microsoft Certified: Azure Administrator Associate",
  "Exam AZ-204: Developing Solutions for Microsoft Azure",
  "Microsoft Certified: Azure Developer Associate",
  "Exam AZ-305: Designing Microsoft Azure Infrastructure Solutions",
  "Microsoft Certified: Azure Solutions Architect Expert",
  "Exam DP-900: Microsoft Azure Data Fundamentals",
  "Exam SC-900: Microsoft Security, Compliance, and Identity Fundamentals",
] as const;

export type TestType = (typeof TEST_TYPES)[number];

function normalizeDifficultyMix(mix: Partial<DifficultyMix>): DifficultyMix {
  return {
    Easy: Number(mix.Easy ?? 0),
    Medium: Number(mix.Medium ?? 0),
    Hard: Number(mix.Hard ?? 0),
  };
}

function assertValidDifficultyMix(mix: DifficultyMix) {
  const total = mix.Easy + mix.Medium + mix.Hard;
  if (!Number.isFinite(total)) throw new Error("Difficulty percentages must be numbers.");
  if (total !== 100) throw new Error(`Difficulty percentages must sum to 100. Got ${total}.`);
  if (mix.Easy < 0 || mix.Medium < 0 || mix.Hard < 0) {
    throw new Error("Difficulty percentages must be >= 0.");
  }
}

export function buildAzureTestPrompt(params: {
  testType: TestType;
  difficultyMix: Partial<DifficultyMix>;
  count?: number; // default 10
}) {
  const count = params.count ?? 10;
  const difficultyMix = normalizeDifficultyMix(params.difficultyMix);
  assertValidDifficultyMix(difficultyMix);

  return `
You are generating a practice test for: "${params.testType}"

Generate exactly ${count} practice questions.

Difficulty distribution (by percentage of total questions):
- Easy: ${difficultyMix.Easy}%
- Medium: ${difficultyMix.Medium}%
- Hard: ${difficultyMix.Hard}%

Each item must include:
- question
- options (A, B, C, D)
- correct_answer
- explanation
- difficulty ("Easy" | "Medium" | "Hard")

Rules:
- correct_answer must be one of "A" | "B" | "C" | "D"
- Return JSON only. No markdown, no extra text.

Output JSON schema:
{
  "testType": string,
  "count": number,
  "difficultyMix": { "Easy": number, "Medium": number, "Hard": number },
  "items": [
    {
      "question": string,
      "options": { "A": string, "B": string, "C": string, "D": string },
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation": string,
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ]
}
`.trim();
}

// Backward-compatible export (defaults)
export const AZURE_TEST_PROMPT = buildAzureTestPrompt({
  testType: "Exam AI-900: Microsoft Azure AI Fundamentals",
  difficultyMix: { Easy: 34, Medium: 33, Hard: 33 },
  count: 10,
});