import { NextResponse } from "next/server";
import supabaseServerClient from "../../../lib/supabaseServerClient";

export async function GET(_req: Request, ctx: { params: Promise<{ examId: string }> }) {
  try {
    const { examId } = await ctx.params;

    const supabase = supabaseServerClient();

    const { data: exam, error: examErr } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examErr) return NextResponse.json({ error: examErr.message}, { status: 500 });

    const total = exam.question.length;

    const summary = {
      id: exam.id,
      totalScore: exam.total_score,
      createdAt: exam.created_at,
      completedAt: exam.completed_at ?? null,
      totalQuestions: total
    };

    return NextResponse.json({ summary, items: exam.question }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}