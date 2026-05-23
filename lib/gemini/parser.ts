/**
 * Extract and parse JSON content safely from Gemini raw text responses.
 * Handles markdown code fences (```json ... ```), trailing commas, and leading/trailing filler conversation.
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
    console.warn("Direct JSON parse failed. Trying Tier 2 (fence cleaning)...");

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
      return JSON.parse(cleanText);
    } catch (fenceErr) {
      console.warn(
        "Fence clean parse failed. Trying Tier 3 (outermost brace slicing)..."
      );

      // Tier 3: Locate the outermost curly braces to extract strictly the JSON object
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
      } catch (sliceErr) {
        console.warn(
          "Slice parse failed. Trying Tier 4 (advanced character-scanning repair)..."
        );

        // Tier 4: Fallback to character scanner repair
        try {
          const repaired = sanitizeJsonStrings(jsonString);
          return JSON.parse(repaired);
        } catch (repairErr: any) {
          throw new Error(
            `Erro ao estruturar dados do plano de aula: ${repairErr.message}`
          );
        }
      }
    }
  }
}

/**
 * Robust JSON string character scanner.
 * Identifies and escapes unescaped double quotes inside JSON string values
 * while maintaining proper boundaries for structural JSON quotes, colons, and delimiters.
 */
function sanitizeJsonStrings(jsonStr: string): string {
  let inString = false;
  let result = "";
  let i = 0;

  // Pre-cleanup trailing commas in arrays/objects
  const cleanStr = jsonStr
    .replace(/,\s*([\]}])/g, "$1")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  while (i < cleanStr.length) {
    const char = cleanStr[i];

    if (char === '"' && cleanStr[i - 1] !== "\\") {
      if (inString) {
        // Peek ahead to see if the next non-whitespace char is a valid JSON structural token (comma, colon, closing brace/bracket)
        let peekIdx = i + 1;
        while (peekIdx < cleanStr.length && /\s/.test(cleanStr[peekIdx])) {
          peekIdx++;
        }
        const nextChar = cleanStr[peekIdx];
        const isEndOfString =
          nextChar === "," ||
          nextChar === "}" ||
          nextChar === "]" ||
          nextChar === ":";

        if (isEndOfString) {
          inString = false;
          result += char;
        } else {
          // This is an unescaped double quote inside the string! Escape it correctly.
          result += '\\"';
        }
      } else {
        inString = true;
        result += char;
      }
    } else {
      result += char;
    }
    i++;
  }
  return result;
}
