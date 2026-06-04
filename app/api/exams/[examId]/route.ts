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

    const { data: rows, error: rowsErr } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId);

    if (rowsErr) return NextResponse.json({ error: rowsErr.message }, { status: 501 });

    const total = rows.length;
    const answered = total;

    const summary = {
      id: exam.id,
      totalScore: exam.total_score,
      createdAt: exam.created_at,
      completedAt: exam.completed_at ?? null,
      totalQuestions: total,
      answeredQuestions: answered,
    };

    return NextResponse.json({ summary, items: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}