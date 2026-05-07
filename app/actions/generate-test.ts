// import { GenerateContentResponse } from "@google/genai";
// import { Question } from "../interfaces/Question";
// import { genAI } from "../lib/googleClient";
// import { buildAzureTestPrompt, type DifficultyMix, type TestType } from "../lib/prompt";

// type GenerateTestResult =
//   | Question[]
//   | {
//     testType: string;
//     count: number;
//     difficultyMix: DifficultyMix;
//     items: Question[];
//   };

// function isRecord(v: unknown): v is Record<string, unknown> {
//   return typeof v === "object" && v !== null;
// }

// export async function generateTest(params?: {
//   testType: TestType;
//   difficultyMix: DifficultyMix;
//   count?: number;
// }): Promise<Question[]> {
//   try {
//     const prompt = params
//       ? buildAzureTestPrompt({
//         testType: params.testType,
//         difficultyMix: params.difficultyMix,
//         count: params.count ?? 10,
//       })
//       : buildAzureTestPrompt({
//         testType: "Exam AI-900: Microsoft Azure AI Fundamentals",
//         difficultyMix: { Easy: 34, Medium: 33, Hard: 33 },
//         count: 10,
//       });

//     const response = await genAI.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [prompt],
//     });

//     const text = (response as GenerateContentResponse).candidates?.[0]?.content?.parts?.[0]?.text;
//     if (!text) return [];

//     let jsonText = text.trim();
//     const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
//     if (match) jsonText = match[1];

//     console.log("Gemini raw response:", text);

//     const parsed = JSON.parse(jsonText) as unknown;

//     // Support both shapes:
//     // (a) legacy: Question[]
//     // (b) new prompt schema: { items: Question[] }
//     if (Array.isArray(parsed)) {
//       return parsed as Question[];
//     }
//     if (isRecord(parsed) && Array.isArray((parsed as any).items)) {
//       return (parsed as any).items as Question[];
//     }

//     return [];
//   } catch (error) {
//     console.error("Google AI error:", error);
//     return [];
//   }
// }