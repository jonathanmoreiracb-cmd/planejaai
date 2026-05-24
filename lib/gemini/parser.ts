import { jsonrepair } from "jsonrepair";

/**
 * Generic clean & repair parse function that returns the raw JSON object/array safely.
 * Handles markdown code fences, unescaped quotes, trailing commas, and incomplete blocks.
 */
export function parseGeminiJSON(text: string): any {
  if (!text) {
    throw new Error("Resposta da IA está vazia.");
  }

  let cleanText = text.trim();

  // Tier 1: Try direct parsing
  try {
    return JSON.parse(cleanText);
  } catch (initialErr) {
    // Tier 2: Strip code fences and try jsonrepair
    if (cleanText.includes("```json")) {
      const parts = cleanText.split("```json");
      const jsonPart = parts[parts.length - 1].split("```")[0];
      cleanText = jsonPart.trim();
    } else if (cleanText.includes("```")) {
      const parts = cleanText.split("```");
      const jsonPart = parts[1] || parts[0];
      cleanText = jsonPart.trim();
    }

    try {
      const repaired = jsonrepair(cleanText);
      return JSON.parse(repaired);
    } catch (repairErr) {
      // Tier 3: Locate outermost curly braces to isolate strictly the JSON content
      const firstBraceIndex = cleanText.indexOf("{");
      const lastBraceIndex = cleanText.lastIndexOf("}");

      if (firstBraceIndex === -1 || lastBraceIndex === -1) {
        console.error(
          "[Parser Error] Text did not contain curly braces:",
          cleanText
        );
        throw new Error(
          `Não foi possível encontrar a estrutura JSON de chaves na resposta. Conteúdo retornado: "${cleanText.slice(
            0,
            150
          )}..."`
        );
      }

      const jsonString = cleanText.slice(firstBraceIndex, lastBraceIndex + 1);

      try {
        const repairedSlice = jsonrepair(jsonString);
        return JSON.parse(repairedSlice);
      } catch (sliceErr: any) {
        throw new Error(
          `Erro ao estruturar dados JSON extraídos: ${sliceErr.message}`
        );
      }
    }
  }
}

/**
 * Parses a raw Gemini text response and normalizes it as a Lesson Plan.
 */
export function parseGeminiResponse(text: string): any {
  const parsed = parseGeminiJSON(text);
  return normalizeLessonPlan(parsed);
}

/**
 * Parses a raw Gemini text response and normalizes it as a School Activity / Worksheet.
 */
export function parseGeminiActivity(text: string): any {
  const parsed = parseGeminiJSON(text);
  return normalizeActivity(parsed);
}

/**
 * Normalizes and hydrates parsed lesson plans to prevent any missing fields,
 * mismatched keys (e.g. descricao vs atividade), or truncated object anomalies.
 */
export function normalizeLessonPlan(plan: any): any {
  if (!plan || typeof plan !== "object") return plan;

  const normalized = {
    titulo: plan.titulo || "Plano de Aula Gerado",
    objetivos: Array.isArray(plan.objetivos) ? plan.objetivos : [],
    habilidades_bncc: Array.isArray(plan.habilidades_bncc)
      ? plan.habilidades_bncc.map((h: any) => ({
          codigo: h?.codigo || "BNCC",
          descricao:
            h?.descricao || "Desenvolvimento de habilidades cognitivas.",
        }))
      : [],
    materiais_necessarios: Array.isArray(plan.materiais_necessarios)
      ? plan.materiais_necessarios
      : [],
    desenvolvimento: Array.isArray(plan.desenvolvimento)
      ? plan.desenvolvimento.map((d: any) => {
          // Normalize alternate/hallucinated AI keys
          const atividade =
            d?.atividade ||
            d?.descricao ||
            "Descrição da atividade prática e contextualização pedagógica.";
          const tipo = d?.tipo || d?.metodologia || "dialógica / expositiva";
          const tempo = d?.tempo || "15 minutos";

          return {
            etapa: d?.etapa || "Etapa de Desenvolvimento",
            tempo: tempo,
            atividade: atividade,
            tipo: tipo,
            observacao: d?.observacao || d?.dica || "",
          };
        })
      : [
          {
            etapa: "Início / Aquecimento",
            tempo: "10 minutos",
            atividade:
              "Acolhimento da turma, introdução dinâmica ao tema e diagnóstico de conhecimentos prévios.",
            tipo: "dialógica / expositiva",
            observacao: "Mantenha a interação dinâmica e engajadora.",
          },
          {
            etapa: "Desenvolvimento",
            tempo: "25 minutos",
            atividade:
              "Realização da atividade principal prática e interativa em grupos.",
            tipo: "prática / colaborativa",
            observacao: "Circule pela sala mediando as dúvidas e interações.",
          },
          {
            etapa: "Fechamento",
            tempo: "10 minutos",
            atividade:
              "Fechamento conceitual, reflexão final sobre a aula e esclarecimento de dúvidas.",
            tipo: "reflexiva",
            observacao: "Consolide os aprendizados principais no quadro.",
          },
        ],
    avaliacao:
      plan.avaliacao ||
      "Avaliação formativa contínua através de observação ativa da participação dos alunos.",
    tarefa_de_casa: plan.tarefa_de_casa || null,
    sugestoes_de_adaptacao: Array.isArray(plan.sugestoes_de_adaptacao)
      ? plan.sugestoes_de_adaptacao.map((s: any) => ({
          para: s?.para || "Alunos com dificuldades",
          adaptacao:
            s?.adaptacao ||
            s?.sugestao ||
            "Suporte pedagógico extra e simplificação dos comandos.",
        }))
      : [
          {
            para: "Alunos com dificuldade",
            adaptacao:
              "Simplificação da atividade ou suporte extra pedagógico.",
          },
          {
            para: "Alunos avançados",
            adaptacao:
              "Atividades extras de aprofundamento científico ou linguístico.",
          },
          {
            para: "Ambiente sem tecnologia",
            adaptacao: "Alternativa offline para os mesmos objetivos.",
          },
        ],
  };

  return normalized;
}

/**
 * Normalizes and hydrates parsed worksheets to prevent missing fields or truncated options.
 */
export function normalizeActivity(activity: any): any {
  if (!activity || typeof activity !== "object") return activity;

  const normalized = {
    titulo: activity.titulo || "Folha de Exercícios",
    instrucoes:
      activity.instrucoes ||
      "Leia as perguntas com bastante atenção e responda da melhor forma possível.",
    questoes: Array.isArray(activity.questoes)
      ? activity.questoes.map((q: any, idx: number) => {
          const tipo = q?.tipo || "dissertativa";
          const enunciado =
            q?.enunciado ||
            "Responda à questão proposta relacionando o tema com o seu cotidiano.";
          const numero = q?.numero || idx + 1;

          if (tipo === "multipla_escolha") {
            const opcoes = Array.isArray(q?.opcoes)
              ? q.opcoes
              : [
                  "A) Alternativa de resposta 1",
                  "B) Alternativa de resposta 2",
                  "C) Alternativa de resposta 3",
                  "D) Alternativa de resposta 4",
                ];
            return {
              numero,
              tipo,
              enunciado,
              opcoes,
            };
          } else {
            return {
              numero,
              tipo,
              enunciado,
              linhas_para_resposta: q?.linhas_para_resposta || 5,
            };
          }
        })
      : [
          {
            numero: 1,
            tipo: "dissertativa",
            enunciado:
              "Escreva uma breve explicação resumindo os principais pontos que você compreendeu sobre este tema.",
            linhas_para_resposta: 6,
          },
        ],
  };

  return normalized;
}
