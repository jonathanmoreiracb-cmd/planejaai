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

  // Pre-cleanup trailing commas and unwanted control characters (preserving raw newlines \n and \r)
  const cleanStr = jsonStr
    .replace(/,\s*([\]}])/g, "$1")
    .replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  while (i < cleanStr.length) {
    const char = cleanStr[i];

    if (char === '"' && cleanStr[i - 1] !== "\\") {
      if (inString) {
        // Peek ahead to see if this is actually the structural end of the string
        let peekIdx = i + 1;
        while (peekIdx < cleanStr.length && /\s/.test(cleanStr[peekIdx])) {
          peekIdx++;
        }
        const nextChar = cleanStr[peekIdx];

        // Advanced structural look-ahead validation
        let isEndOfString = false;

        if (nextChar === "}" || nextChar === "]" || nextChar === ":") {
          isEndOfString = true;
        } else if (nextChar === ",") {
          // If followed by a comma, peek further to see if the next token is a valid JSON structural starter
          let afterCommaIdx = peekIdx + 1;
          while (
            afterCommaIdx < cleanStr.length &&
            /\s/.test(cleanStr[afterCommaIdx])
          ) {
            afterCommaIdx++;
          }
          const afterCommaChar = cleanStr[afterCommaIdx];

          // Valid starters after a comma in a valid JSON are:
          // '"' (next key or string value), '{' (next object), '[' (next array),
          // digits/minus (numbers), 't'/'f'/'n' (booleans/null)
          isEndOfString =
            afterCommaChar === '"' ||
            afterCommaChar === "{" ||
            afterCommaChar === "[" ||
            afterCommaChar === "-" ||
            (afterCommaChar >= "0" && afterCommaChar <= "9") ||
            afterCommaChar === "t" ||
            afterCommaChar === "f" ||
            afterCommaChar === "n";
        }

        if (isEndOfString) {
          inString = false;
          result += char;
        } else {
          // This is an unescaped double quote inside the string value! Escape it safely.
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
