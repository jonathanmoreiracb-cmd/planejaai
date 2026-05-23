import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { REGENERATE_BLOCK_PROMPT } from "@/lib/gemini/prompts";
import { parseGeminiResponse } from "@/lib/gemini/parser";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const {
      tema,
      disciplina,
      ano,
      tempoTotal,
      etapaNome,
      etapaTempo,
      etapaAtividade,
      etapaTipo,
      etapaObservacao,
      estiloSolicitado,
    } = await req.json();

    if (
      !tema ||
      !disciplina ||
      !ano ||
      !etapaNome ||
      !etapaTempo ||
      !estiloSolicitado
    ) {
      return NextResponse.json(
        { error: "Dados insuficientes para regerar este bloco." },
        { status: 400 }
      );
    }

    // 1. Fetch user's school context from Supabase to maintain consistency during regeneration
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let infraText = "Recursos padrão de sala de aula convencional.";
    let classProfileText = "Turma regular.";
    let literacyText = "Alinhado com a média.";
    let specialNeedsText = "Sem demandas de inclusão informadas.";

    if (user) {
      const { data: context, error: contextError } = await supabase
        .from("school_context")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (context && !contextError) {
        const infraItems = [];
        if (context.has_projector)
          infraItems.push("Possui Projetor/TV em sala");
        if (context.has_internet)
          infraItems.push("Possui internet wifi em sala");
        if (context.has_patio) infraItems.push("Possui Pátio aberto");
        if (context.has_library) infraItems.push("Possui Biblioteca");

        infraText =
          infraItems.length > 0
            ? infraItems.join(", ")
            : "Sem tecnologia extra.";
        classProfileText =
          context.class_characteristics || "Sem características anormais.";
        literacyText = context.literacy_level || "Alfabético.";
        specialNeedsText = context.has_special_needs
          ? "Possui alunos de inclusão."
          : "Sem demandas de inclusão.";
      }
    }

    // 2. Build the prompt template
    const prompt = REGENERATE_BLOCK_PROMPT.replace(/{tema}/g, tema)
      .replace(/{disciplina}/g, disciplina)
      .replace(/{ano}/g, ano)
      .replace(/{tempo_total}/g, tempoTotal)
      .replace("{infraestrutura}", infraText)
      .replace("{perfil_turma}", classProfileText)
      .replace("{alfabetizacao}", literacyText)
      .replace("{inclusao}", specialNeedsText)
      .replace(/{etapa_nome}/g, etapaNome)
      .replace(/{etapa_tempo}/g, etapaTempo)
      .replace("{etapa_atividade}", etapaAtividade || "")
      .replace("{etapa_tipo}", etapaTipo || "")
      .replace("{etapa_observacao}", etapaObservacao || "")
      .replace("{estilo_solicitado}", estiloSolicitado);

    // 3. Request Geração
    const model = getGeminiModel();

    console.log(
      `[API RegenerateBlock] Regerando bloco "${etapaNome}" com estilo "${estiloSolicitado}"...`
    );

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const newBlockData = parseGeminiResponse(responseText);

    if (!newBlockData || !newBlockData.atividade) {
      throw new Error(
        "Resposta do Gemini não retornou o bloco formatado corretamente."
      );
    }

    return NextResponse.json({ success: true, block: newBlockData });
  } catch (err: any) {
    console.error("[API RegenerateBlock] Erro fatal:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao regerar bloco do plano de aula." },
      { status: 500 }
    );
  }
}
