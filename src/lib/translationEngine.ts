import { z } from "zod";

// 1. Zod Schemas for Strict Response Validation
const atlasResponseSchema = z.object({
  // Adjust these fields based on the exact N-ATLAS JSON shape
  translation: z.string().min(1), 
});

const openAIResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().min(1),
      }),
    })
  ).min(1),
});

export type TranslationResult = {
  text: string;
  engineUsed: "PRIMARY" | "N-ATLAS" | "GPT-4O-MINI" | "MULTILINGUAL-FALLBACK";
  latencyMs: number;
};

// 2. The Core Fallback Engine
export async function runTranslationCascade(
  textToTranslate: string, 
  sourceLang: string, 
  targetLang: string
): Promise<TranslationResult> {
  
  const startTime = performance.now();

  // ---------------------------------------------------------
  // ENGINE 1: N-ATLAS (First Fallback for African Languages)
  // ---------------------------------------------------------
  try {
    const atlasResponse = await fetch("https://api.n-atlas.example.com/v1/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NATLAS_API_KEY}`,
      },
      body: JSON.stringify({
        text: textToTranslate,
        source: sourceLang,
        target: targetLang,
      }),
      signal: AbortSignal.timeout(4000), // 4-second timeout limit
    });

    if (atlasResponse.ok) {
      const rawData = await atlasResponse.json();
      const parsedData = atlasResponseSchema.parse(rawData); // Zod Validation
      
      return {
        text: parsedData.translation,
        engineUsed: "N-ATLAS",
        latencyMs: Math.round(performance.now() - startTime),
      };
    }
  } catch (error) {
    console.warn(`[N-ATLAS Failed] Cascading to next engine. Error:`, error);
  }

  // ---------------------------------------------------------
  // ENGINE 2: OpenAI GPT-4o-mini (Second Fallback)
  // ---------------------------------------------------------
  try {
    const openAIStartTime = performance.now();
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a professional translator. Translate from ${sourceLang} to ${targetLang}. Respond ONLY with the translated text.` },
          { role: "user", content: textToTranslate }
        ],
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(5000), // 5-second timeout limit
    });

    if (openAIResponse.ok) {
      const rawData = await openAIResponse.json();
      const parsedData = openAIResponseSchema.parse(rawData); // Zod Validation
      
      return {
        text: parsedData.choices[0].message.content.trim(),
        engineUsed: "GPT-4O-MINI",
        latencyMs: Math.round(performance.now() - openAIStartTime),
      };
    }
  } catch (error) {
    console.warn(`[GPT-4o-mini Failed] Cascading to final fallback. Error:`, error);
  }

  // ---------------------------------------------------------
  // ENGINE 3: Final Multilingual Service (e.g., Free LibreTranslate or basic dictionary)
  // ---------------------------------------------------------
  // If all APIs fail (rate limits, timeouts), return a safe fallback rather than crashing
  return {
    text: "Translation service temporarily unavailable. Please try again.",
    engineUsed: "MULTILINGUAL-FALLBACK",
    latencyMs: Math.round(performance.now() - startTime),
  };
}