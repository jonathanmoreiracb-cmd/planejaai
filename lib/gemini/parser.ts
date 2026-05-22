/**
 * Extract and parse JSON content safely from Gemini raw text responses.
 * Handles markdown code fences (```json ... ```), trailing commas, and leading/trailing filler conversation.
 */
export function parseGeminiResponse(text: string): any {
  if (!text) {
    throw new Error("Resposta da IA está vazia.");
  }

  // 1. Clean markdown code fences if present
  let cleanText = text.trim();

  if (cleanText.includes("```json")) {
    const parts = cleanText.split("```json");
    const jsonPart = parts[parts.length - 1].split("```")[0];
    cleanText = jsonPart.trim();
  } else if (cleanText.includes("```")) {
    const parts = cleanText.split("```");
    const jsonPart = parts[1] || parts[0];
    cleanText = jsonPart.trim();
  }

  // 2. Locate the outermost curly braces to extract strictly the JSON object
  const firstBraceIndex = cleanText.indexOf("{");
  const lastBraceIndex = cleanText.lastIndexOf("}");

  if (firstBraceIndex === -1 || lastBraceIndex === -1) {
    throw new Error(
      "Não foi possível encontrar a estrutura JSON de chaves na resposta."
    );
  }

  const jsonString = cleanText.slice(firstBraceIndex, lastBraceIndex + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error(
      "Failed standard JSON parse. Attempting fallback sanitization...",
      err
    );

    // 3. Fallback cleanups: replace single quotes or trailing commas in arrays
    try {
      const sanitized = jsonString
        .replace(/,\s*([\]}])/g, "$1") // remove trailing commas
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // remove control chars
      return JSON.parse(sanitized);
    } catch (secondErr: any) {
      throw new Error(
        `Erro ao estruturar dados do plano de aula: ${secondErr.message}`
      );
    }
  }
}
