import { NextResponse } from "next/server";
import { genAI } from "../../lib/googleClient";
import { buildAzureTestPrompt, type DifficultyMix, type TestType } from "../../lib/prompt";
import type { Question } from "../../interfaces/Question";

type Body = {
  testType: TestType;
  difficultyMix: DifficultyMix;
  count?: number;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { testType, difficultyMix, count } = body as Body;

    const prompt = buildAzureTestPrompt({
      testType,
      difficultyMix,
      count: count ?? 10,
    });

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return NextResponse.json({ items: [] satisfies Question[] });

    // handle accidental ```json blocks
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = (match?.[1] ?? text).trim();

    const parsed = JSON.parse(jsonText) as unknown;

    // accept either: Question[] OR { items: Question[] }
    const items: Question[] =
      Array.isArray(parsed) ? (parsed as Question[]) : isRecord(parsed) && Array.isArray((parsed as any).items)
        ? ((parsed as any).items as Question[])
        : [];

    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate test" }, { status: 500 });
  }
}