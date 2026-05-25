import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { plan, profile } = await req.json();

    if (!plan || !profile) {
      return NextResponse.json(
        { error: "Os campos plan e profile são obrigatórios." },
        { status: 400 }
      );
    }

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
        { error: "Não autorizado. Faça login primeiro." },
        { status: 401 }
      );
    }

    // Define psicopedagogical prompt instructions for each inclusion profile
    let profileInstructions = "";
    let profileLabel = "";

    switch (profile) {
      case "tea":
        profileLabel = "TEA (Transtorno do Espectro Autista)";
        profileInstructions = `
        - Crie uma estrutura visual altamente previsível e sequencial.
        - Evite linguagem figurada, metáforas ou instruções ambíguas.
        - Inclua suportes visuais explícitos (ex: cartões visuais, imagens de apoio) para guiar o aluno em cada tarefa.
        - Adicione momentos estruturados para regulação sensorial ou intervalos silenciosos se necessário.
        - Divida as instruções complexas em passos ultra-pequenos e diretos.
        `;
        break;
      case "tdah":
        profileLabel =
          "TDAH (Transtorno de Déficit de Atenção e Hiperatividade)";
        profileInstructions = `
        - Quebre as tarefas longas em sessões dinâmicas e curtas de 10 a 15 minutos.
        - Introduza elementos lúdicos, gamificação ou desafios práticos de movimento físico.
        - Mantenha instruções de foco ativas, sugerindo checkpoints e pequenos lembretes visuais.
        - Adicione intervalos rápidos estruturados (ex: alongamento) entre as atividades de foco.
        - Priorize tarefas ativas (hands-on) em vez de explicações puramente expositivas passivas.
        `;
        break;
      case "dislexia":
        profileLabel = "Dificuldade de Leitura / Dislexia";
        profileInstructions = `
        - Reduza a carga de leitura densa e escrita manual extensiva.
        - Proponha alternativas baseadas em recursos áudio-visuais (vídeos, áudios, esquemas mentais ou desenhos).
        - Substitua textos explicativos por tópicos pontuais de linguagem simplificada.
        - Valorize respostas orais, debates em dupla ou demonstrações práticas em vez de fichas escritas tradicionais.
        - Utilize fontes legíveis recomendadas e leitura compartilhada.
        `;
        break;
      case "avancado":
        profileLabel = "Alunos Avançados / Superdotação";
        profileInstructions = `
        - Introduza tarefas de extensão investigativas mais complexas.
        - Proponha questionamentos de nível cognitivo superior (análise crítica, criação própria, síntese de ideias).
        - Sugira links para projetos autónomos de pesquisa aplicada.
        - Incentive o aluno a atuar como monitor facilitador dos grupos ou a aprofundar hipóteses alternativas.
        `;
        break;
      default:
        return NextResponse.json(
          { error: "Perfil de inclusão não reconhecido." },
          { status: 400 }
        );
    }

    const systemPrompt = `
    Você é um especialista em Psicopedagogia, Acessibilidade e Educação Especial (AEE) no Brasil.
    Sua missão é receber um Plano de Ação/Plano de Aula existente e adaptá-lo metodologicamente para um aluno com o perfil: **${profileLabel}**.

    ### Plano Original a Adaptar:
    Título: ${plan.title}
    Descrição Original: ${plan.description}
    Estrutura de Aulas (Weeks & Days):
    ${JSON.stringify(plan.weeks, null, 2)}

    ### Instruções Metodológicas de Acessibilidade:
    ${profileInstructions}

    ### REQUISITOS OBRIGATÓRIOS DO RETORNO:
    1. Retorne **EXCLUSIVAMENTE** um objeto JSON válido. Não inclua nenhuma explicação externa, markdown fences (\`\`\`), ou textos adicionais antes ou depois do JSON.
    2. O JSON deve possuir **exatamente a mesma estrutura** do plano original:
       {
         "title": "[Título Adaptado com indicação do Perfil, ex: 'Título do Plano - Adaptado para TEA']",
         "description": "[Breve resumo adaptado descrevendo o foco da acessibilidade pedagógica aplicada]",
         "weeks": [
           {
             "weekNumber": 1,
             "theme": "[Tema da semana]",
             "days": [
               {
                 "day": 1,
                 "topic": "[Tema do dia adaptado]",
                 "duration": "[Duração]",
                 "tasks": [
                   "[Tarefa 1 adaptada psicopedagogicamente]",
                   "[Tarefa 2 adaptada psicopedagogicamente]",
                   ...
                 ]
               }
             ]
           }
         ],
         "tips": [
           "[Dica 1 de aplicação inclusiva em sala de aula]",
           "[Dica 2 de aplicação inclusiva em sala de aula]"
         ]
       }
    3. Mantenha os mesmos temas gerais das aulas e as mesmas habilidades da BNCC implícitas. Altere apenas a **forma de ensinar e executar as tarefas** para que o aluno do perfil consiga realizar com sucesso, autonomia e dignidade pedagógica.
    4. Garanta ortografia perfeita e redação clara em português brasileiro.
    `;

    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3500,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    let adaptedPlan;

    try {
      adaptedPlan = JSON.parse(responseText);
    } catch (parseErr) {
      // Strips markdown backticks if output was wrapped
      const cleaned = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      adaptedPlan = JSON.parse(cleaned);
    }

    if (!adaptedPlan || !adaptedPlan.title || !adaptedPlan.weeks) {
      throw new Error("A IA gerou um plano adaptado inválido ou incompleto.");
    }

    return NextResponse.json({ success: true, plan: adaptedPlan });
  } catch (err: any) {
    console.error("[API AdaptPlan] Erro na geração adaptativa:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Erro interno ao processar a adaptação inclusiva do seu plano de aula.",
      },
      { status: 500 }
    );
  }
}
