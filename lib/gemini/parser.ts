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
    return JSON.parse(cleanText);
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
      return JSON.parse(repaired);
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
        return JSON.parse(repairedSlice);
      } catch (sliceErr: any) {
        throw new Error(
          `Erro ao estruturar dados do plano de aula: ${sliceErr.message}`
        );
      }
    }
  }
}
