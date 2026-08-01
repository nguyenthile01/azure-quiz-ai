import { NextRequest, NextResponse } from "next/server";
import supabaseServerClient from "../../../lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServerClient();
    const body = await req.json();

    const { data: exams, error: examsErr } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", body.user.id)
      .order("created_at", { ascending: false });

    if (examsErr) return NextResponse.json({ error: examsErr.message }, { status: 500 });
    if (!exams?.length) return NextResponse.json({ items: [] }, { status: 200 });

    const items = exams.map((e) => {
      const total = e.question.length;
      // const answered = e.question.filter((q) => q.answered).length;
      return {
        id: e.id,
        totalScore: e.total_score,
        createdAt: e.created_at,
        completedAt: e.completed_at ?? null,
        totalQuestions: total
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load exams" }, { status: 500 });
  }
}