import { NextRequest, NextResponse } from "next/server";
import type { Question } from "../../../interfaces/Question";
import supabaseServerClient from "../../../lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServerClient();
    const body = (await req.json());

    const { data: createdQuestions, error: qErr } = await supabase
      .from("questions")
      .insert(
        (body.items as Question[]).map((q) => ({
          question: q.question,
          options: q.options, // jsonb (array of strings)
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty ?? null,
          exam_id: body.examResId,
          user_id: body.user.id
        })),
      )
      .select("id");

    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

    return NextResponse.json({ data: createdQuestions }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}