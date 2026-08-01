import { NextRequest, NextResponse } from "next/server";
import type { Question } from "../../../interfaces/Question";
import supabaseServerClient from "../../../lib/supabaseServerClient";
import { isRecord } from "@/app/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServerClient();

    const body = (await req.json());
    if (!isRecord(body) || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const itemsRaw = body.items as Question[];
    if (itemsRaw.length === 0) return NextResponse.json({ error: "No questions provided" }, { status: 400 });

    const { data: exam, error: examErr } = await supabase
      .from("exams")
      .insert({
        user_id: body.user_id,
        total_score: "0",
        question: itemsRaw.map((q) => {
          const { question, options, correct_answer, explanation, difficulty } = q;
          return { question, options, correct_answer, explanation, difficulty };
        }),
      })
      .select("id")
      .single();

    if (examErr) return NextResponse.json({ error: examErr.message }, { status: 500 });

    return NextResponse.json({ exam }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}