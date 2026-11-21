import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { runTranslationCascade } from "../../../lib/translationEngine";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Languages supported by Groq Whisper Turbo (Igbo 'ig' is not supported)
const WHISPER_SUPPORTED_LANGS = new Set(["en", "ha", "yo", "fr", "ar", "sw", "es", "de", "pt"]);

// Vocabulary prompts to improve Whisper accuracy on regional languages
const LANGUAGE_PROMPTS: Record<string, string> = {
  ha: "Ina kwana, barka da safiya, barka da rana, barka da yamma, nagode, sannu, lafiya lau.",
  yo: "Bawo ni, e kaaro, e kaasan, e kaale, e se, jowo, o dabo.",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const sourceLang = (formData.get("sourceLang") as string) || "en";
    const targetLang = (formData.get("targetLang") as string) || "ha";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Reject unsupported voice languages and direct user to the text box
    if (!WHISPER_SUPPORTED_LANGS.has(sourceLang)) {
      return NextResponse.json(
        {
          error: `Voice recording isn't supported for '${sourceLang.toUpperCase()}' yet. Please use the text box below to type and translate.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = new File([buffer], "recording.webm", { type: audioFile.type || "audio/webm" });

    // Step 1: Transcribe audio to text using Whisper Turbo
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: sourceLang,
      ...(LANGUAGE_PROMPTS[sourceLang] ? { prompt: LANGUAGE_PROMPTS[sourceLang] } : {}),
    });

    const transcribedText = transcription.text;

    // Step 2: Resilient Translation Engine Cascade
    let translatedText = "";
    let engineUsed = "GROQ_PRIMARY";
    let latencyMs = 0;
    const startTime = performance.now();

    try {
      // ATTEMPT 1: Primary Engine (Groq GPT-OSS 20B)
      const translation = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `You are a professional interpreter. Translate the following text from ISO language code '${sourceLang}' to ISO language code '${targetLang}'. Return ONLY the direct translation. Do not include quotes, conversational filler, or explanations.`,
          },
          { role: "user", content: transcribedText },
        ],
      });

      translatedText = translation.choices[0]?.message?.content || "";
      if (!translatedText) throw new Error("Groq returned empty translation");

      latencyMs = Math.round(performance.now() - startTime);
    } catch (groqError) {
      console.warn("[Primary Engine Failed] Groq translation error, initiating cascade:", groqError);

      // ATTEMPT 2, 3, & 4: N-ATLAS -> GPT-4o-mini -> Final Fallback
      const cascadeResult = await runTranslationCascade(transcribedText, sourceLang, targetLang);

      translatedText = cascadeResult.text;
      engineUsed = cascadeResult.engineUsed;
      latencyMs = cascadeResult.latencyMs;
    }

    return NextResponse.json(
      {
        text: translatedText,
        originalText: transcribedText,
        meta: { engineUsed, latencyMs },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Pipeline error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}