import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { GENERATE_ACTIVITY_PROMPT } from "@/lib/gemini/prompts";
import { parseGeminiActivity } from "@/lib/gemini/parser";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { tema, disciplina, ano } = await req.json();

    if (!tema || !disciplina || !ano) {
      return NextResponse.json(
        { error: "Os campos tema, disciplina e ano são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Fetch school context from Supabase for age/literacy adapted sheets
    const supabase = createClient();

    const isMock = req.cookies.get("use_mock_demo")?.value === "true";

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let user = authUser;

    if (!user && isMock) {
      user = { id: "mock-user-id-teacher" } as any;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Nao autorizado. Faca login primeiro." },
        { status: 401 }
      );
    }

    let planTier = "free";

    if (isMock) {
      planTier = "pro"; // Demo users get mock Pro tier
    } else {
      // Check subscription plan tier
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      planTier = subData?.plan_tier || "free";
    }

    if (planTier !== "pro" && planTier !== "escola" && planTier !== "school") {
      return NextResponse.json(
        {
          error:
            "A geracao de folhas de atividades praticas em PDF e exclusiva para assinantes do Plano Pro. Faca o upgrade para liberar!",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    let classProfileText = "Turma comum do correspondente ano escolar.";
    let literacyText = "Alinhado com a média.";

    if (user && !isMock) {
      const { data: context, error: contextError } = await supabase
        .from("school_context")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (context && !contextError) {
        classProfileText =
          context.class_characteristics || "Comportamento típico da idade.";
        literacyText = context.literacy_level || "Alfabético.";
      }
    }

    // 2. Build prompt template
    const prompt = GENERATE_ACTIVITY_PROMPT.replace(/{tema}/g, tema)
      .replace(/{disciplina}/g, disciplina)
      .replace(/{ano}/g, ano)
      .replace("{alfabetizacao}", literacyText)
      .replace("{perfil_turma}", classProfileText);

    // 3. Request Geração with Gemini Pro
    const model = getGeminiModel();

    console.log(
      `[API GenerateActivity] Chamando Gemini Pro para folha de exercícios ("${tema}")...`
    );

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const activityData = parseGeminiActivity(responseText);

    if (!activityData || !activityData.titulo || !activityData.questoes) {
      throw new Error(
        "Resposta da IA para a folha de exercícios foi malformada ou incompleta."
      );
    }

    return NextResponse.json({ success: true, activity: activityData });
  } catch (err: any) {
    console.error("[API GenerateActivity] Erro:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Erro interno ao processar a geração da atividade escolar com a IA.",
      },
      { status: 500 }
    );
  }
}
