import { jsonrepair } from "jsonrepair";

/**
 * Extract and parse JSON content safely from Gemini raw text responses.
 * Uses the industry-standard 'jsonrepair' engine to fix malformed JSON on the fly,
 * including unescaped quotes, literal newlines, trailing commas, and missing delimiters.
 */
export function parseGeminiResponse(text: string): any {
  if (!text) {
    throw new Error("Resposta da IA está vazia.");
  }

  let cleanText = text.trim();

  // Tier 1: Try parsing the direct raw response (instant & safe for native JSON responses)
  try {
    return normalizeLessonPlan(JSON.parse(cleanText));
  } catch (initialErr) {
    console.warn("Direct JSON parse failed. Trying Tier 2 (jsonrepair)...");

    // Tier 2: Clean markdown code fences if present
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
      return normalizeLessonPlan(JSON.parse(repaired));
    } catch (repairErr) {
      console.warn(
        "Direct jsonrepair failed. Trying Tier 3 (outermost brace slicing + jsonrepair)..."
      );

      // Tier 3: Locate the outermost curly braces to extract strictly the JSON object
      const firstBraceIndex = cleanText.indexOf("{");
      const lastBraceIndex = cleanText.lastIndexOf("}");

      if (firstBraceIndex === -1 || lastBraceIndex === -1) {
        console.error(
          "[Parser Error] Text did not contain curly braces:",
          cleanText
        );
        throw new Error(
          `Não foi possível encontrar a estrutura JSON de chaves na resposta. Conteúdo retornado: "${cleanText.slice(0, 150)}..."`
        );
      }

      const jsonString = cleanText.slice(firstBraceIndex, lastBraceIndex + 1);

      try {
        const repairedSlice = jsonrepair(jsonString);
        return normalizeLessonPlan(JSON.parse(repairedSlice));
      } catch (sliceErr: any) {
        throw new Error(
          `Erro ao estruturar dados do plano de aula: ${sliceErr.message}`
        );
      }
    }
  }
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
