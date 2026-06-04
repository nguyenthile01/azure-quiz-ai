import { NextRequest, NextResponse } from "next/server";
import supabaseServerClient from "../../../lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServerClient();
    const body = await req.json();

    const { data: exams, error: examsErr } = await supabase
      .from("exams")
      .select("id,total_score,created_at,completed_at")
      .eq("user_id", body.user.id)
      .order("created_at", { ascending: false });

    if (examsErr) return NextResponse.json({ error: examsErr.message }, { status: 500 });
    if (!exams?.length) return NextResponse.json({ items: [] }, { status: 200 });

    const examIds = exams.map((e) => e.id);

    // Count total questions per exam
    const { data: examQuestions, error: eqErr } = await supabase
      .from("exam_questions")
      .select("exam_id,question_id")
      .in("exam_id", examIds);

    if (eqErr) return NextResponse.json({ error: eqErr.message }, { status: 500 });

    const counts = new Map<string, number>();
    for (const row of examQuestions ?? []) {
      counts.set(row.exam_id, (counts.get(row.exam_id) ?? 0) + 1);
    }

    const items = exams.map((e) => {
      const total = counts.get(e.id) ?? 0;
      const answered = total; // with current schema
      return {
        id: e.id,
        totalScore: e.total_score,
        createdAt: e.created_at,
        completedAt: e.completed_at ?? null,
        totalQuestions: total,
        answeredQuestions: answered,
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load exams" }, { status: 500 });
  }
}