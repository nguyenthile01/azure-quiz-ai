import { NextRequest, NextResponse } from "next/server";
import supabaseServerClient from "../../../lib/supabaseServerClient";

type Body = {
  examId: string;
  totalScore: string;
  userId: string;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServerClient();

    const body = await req.json() as Body;

    const { examId, totalScore, userId } = body;

    // Ensure exam belongs to user
    const { data: exam, error: examErr } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examErr) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    if (exam.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error: updErr } = await supabase
      .from("exams")
      .update({
        total_score: totalScore,
        question: exam.question,
        completed_at: new Date().toISOString(),
      })
      .eq("id", examId);

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}