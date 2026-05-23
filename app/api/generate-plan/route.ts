import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { GENERATE_PLAN_PROMPT } from "@/lib/gemini/prompts";
import { parseGeminiResponse } from "@/lib/gemini/parser";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const {
      tema,
      disciplina,
      ano,
      tempo,
      necessidadeEspecial,
      incluirPratica,
      incluirAvaliacao,
      incluirTarefa,
    } = await req.json();

    if (!tema || !disciplina || !ano || !tempo) {
      return NextResponse.json(
        { error: "Os campos tema, disciplina, ano e tempo são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Fetch user's school context from Supabase Server Client
    const supabase = createClient();

    // Check if the user is in Mock Demo mode via cookies
    const isMock = req.cookies.get("use_mock_demo")?.value === "true";

    // Get the active session user
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
      // Fetch subscription status and count monthly generations
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      planTier = subData?.plan_tier || "free";
    }

    if (planTier === "free" && !isMock) {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();

      const { count, error: countErr } = await supabase
        .from("lesson_plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth);

      if (!countErr && count !== null && count >= 3) {
        return NextResponse.json(
          {
            error:
              "Limite de 3 planos gratuitos mensais atingido! Faca upgrade para o Plano Pro para ter acesso ilimitado.",
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    let infraText = "Recursos padrão básicos de sala de aula comum.";
    let classProfileText = "Turma comum do ano letivo correspondente.";
    let literacyText = "Alinhado com a média nacional do ano escolar.";
    let specialNeedsText = "Sem demandas de inclusão específicas informadas.";
    let studentsCountText = "Entre 20 e 30 alunos.";

    if (user && !isMock) {
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
          infraItems.push("Possui Acesso à internet wifi em sala");
        if (context.has_patio)
          infraItems.push(
            "Possui Pátio aberto para atividades físicas e recreação"
          );
        if (context.has_library)
          infraItems.push("Possui Biblioteca escolar ativa");

        infraText =
          infraItems.length > 0
            ? infraItems.join(", ")
            : "Sala de aula convencional sem recursos extras (projetor, internet ou biblioteca ausentes).";

        classProfileText =
          context.class_characteristics || "Comportamento típico da idade.";
        literacyText = context.literacy_level || "Alfabético.";
        specialNeedsText = context.has_special_needs
          ? "Sim, há alunos com necessidades especiais genéricas que necessitam de acessibilidade pedagógica."
          : "Não há alunos com necessidades especiais genéricas reportados.";
        studentsCountText = `${context.students_count || "21-30"} alunos.`;
      }
    }

    // Explicit Pedagogical Special Needs Inclusão Overrides
    if (necessidadeEspecial && necessidadeEspecial !== "regular") {
      const conditionMap: Record<string, string> = {
        tdah: "FOCO DE INCLUSÃO OBRIGATÓRIO (TDAH - Transtorno de Déficit de Atenção e Hiperatividade): O plano de aula DEVE ser adaptado para TDAH. Divida a aula em dinâmicas curtas de no máximo 10 a 15 minutos, evite longas sessões de leitura ou teoria expositiva pura, inclua micro-pausas ativas ou mudanças de estímulo tátil e ofereça instruções curtas e diretas passo a passo.",
        autismo:
          "FOCO DE INCLUSÃO OBRIGATÓRIO (Autismo / TEA - Transtorno do Espectro Autista): O plano de aula DEVE ser adaptado para Autismo. Organize uma rotina extremamente clara, use apoios visuais estruturados, evite metáforas ou duplos sentidos sem explicação literal, estabeleça alternativas de participação individual ou em duplas pequenas para evitar sobrecarga social, e preveja adaptações sensoriais (como espaço calmo/baixa luminosidade se necessário).",
        dislexia:
          "FOCO DE INCLUSÃO OBRIGATÓRIO (Dislexia e Transtornos de Leitura): O plano de aula DEVE ser adaptado para Dislexia. Apoie-se fortemente em mídias visuais e orais, reduza textos longos escritos no quadro, sugira fontes limpas e espaçadas nas folhas práticas, e em hipótese alguma penalize erros ortográficos ou realize leituras orais forçadas sob pressão.",
        visual:
          "FOCO DE INCLUSÃO OBRIGATÓRIO (Deficiência Visual - Baixa Visão/Cegueira): O plano de aula DEVE ser adaptado para Deficiência Visual. Promova a audiodescrição minuciosa de todas as imagens, mapas e diagramas, explore maquetes e objetos táteis tridimensionais nas etapas de desenvolvimento, e use alto contraste visual em todas as projeções.",
        auditiva:
          "FOCO DE INCLUSÃO OBRIGATÓRIO (Deficiência Auditiva / Surdez): O plano de aula DEVE ser adaptado para Deficiência Auditiva. Forneça materiais escritos, diagramas e mapas de apoio abundantes antes e durante a aula, garanta que o professor fale de frente para a classe com boa iluminação facial para leitura labial, e preveja a atuação em conjunto com intérprete de LIBRAS.",
        intelectual:
          "FOCO DE INCLUSÃO OBRIGATÓRIO (Deficiência Intelectual / Dificuldade Cognitiva): O plano de aula DEVE ser adaptado para Deficiência Intelectual. Fragmente os conteúdos complexos em etapas sequenciais muito diretas com exemplos do cotidiano concreto do aluno, use imagens e ilustrações explicativas, e dê tempo estendido para a realização de tarefas práticas.",
        superdotacao:
          "FOCO DE INCLUSÃO OBRIGATÓRIO (Altas Habilidades / Superdotação): O plano de aula DEVE ser enriquecido para Altas Habilidades. Além da atividade regular, prepare desafios extras, problemas abertos de pesquisa ou projetos de aprofundamento investigativo para manter o engajamento intelectual elevado do estudante.",
      };

      if (conditionMap[necessidadeEspecial]) {
        specialNeedsText = conditionMap[necessidadeEspecial];
      }
    }

    // 2. Format the Generation Prompt Template
    const prompt = GENERATE_PLAN_PROMPT.replace(/{tema}/g, tema)
      .replace(/{disciplina}/g, disciplina)
      .replace(/{ano}/g, ano)
      .replace(/{tempo}/g, tempo)
      .replace("{infraestrutura}", infraText)
      .replace("{perfil_turma}", classProfileText)
      .replace("{alfabetizacao}", literacyText)
      .replace("{inclusao}", specialNeedsText)
      .replace("{num_alunos}", studentsCountText)
      .replace(
        "{incluir_pratica}",
        incluirPratica
          ? "Sim, obrigatório propor uma dinâmica de grupo ou laboratório prático durável"
          : "Não há requisito prático obrigatório"
      )
      .replace(
        "{incluir_avaliacao}",
        incluirAvaliacao
          ? "Sim, inclua critérios e formatos detalhados de avaliação formativa"
          : "Avaliação formativa simples"
      )
      .replace(
        "{incluir_tarefa}",
        incluirTarefa
          ? "Sim, formule uma tarefa para casa alinhada e instrutiva"
          : "Sem tarefa de casa"
      );

    // 3. Request Geração with 3-Attempt Retry Loop
    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;
    let planData = null;

    const model = getGeminiModel();

    while (attempt < maxRetries) {
      try {
        console.log(
          `[API GeneratePlan] Chamando Gemini Pro (Tentativa ${attempt + 1}/${maxRetries})...`
        );

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        });

        const responseText = result.response.text();
        planData = parseGeminiResponse(responseText);

        // If parsed successfully, break the retry loop
        if (planData && planData.titulo && planData.desenvolvimento) {
          break;
        }
      } catch (err: any) {
        attempt++;
        lastError = err;
        console.warn(
          `[API GeneratePlan] Erro na tentativa ${attempt}:`,
          err.message
        );

        // Wait briefly before retrying
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!planData) {
      throw new Error(
        `Falha ao gerar plano de aula após ${maxRetries} tentativas. Último erro: ${lastError?.message}`
      );
    }

    return NextResponse.json({ success: true, plan: planData });
  } catch (err: any) {
    console.error("[API GeneratePlan] Erro fatal:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Erro interno ao processar a geração com a inteligência artificial.",
      },
      { status: 500 }
    );
  }
}
