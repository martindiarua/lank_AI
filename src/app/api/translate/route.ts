import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { runTranslationCascade } from "@/lib/translationEngine";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang = "en", targetLang = "ha" } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    let translatedText = "";
    let engineUsed = "GROQ_PRIMARY";
    const startTime = performance.now();

    try {
      const translation = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `You are a professional interpreter. Translate the following text from ISO language code '${sourceLang}' to ISO language code '${targetLang}'. Return ONLY the direct translation. Do not include quotes, conversational filler, or explanations.`,
          },
          { role: "user", content: text },
        ],
      });

      translatedText = translation.choices[0]?.message?.content?.trim() || "";
      if (!translatedText) throw new Error("Empty Groq response");
    } catch {
      const cascade = await runTranslationCascade(text, sourceLang, targetLang);
      translatedText = cascade.text;
      engineUsed = cascade.engineUsed;
    }

    return NextResponse.json({
      originalText: text,
      text: translatedText,
      meta: { engineUsed, latencyMs: Math.round(performance.now() - startTime) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}