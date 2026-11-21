import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { sourceLang, targetLang, originalText, translatedText } = await req.json();

    if (!originalText || !translatedText) {
      return NextResponse.json({ error: "Missing text data" }, { status: 400 });
    }

    // Insert the new translation record into your Neon PostgreSQL database
    const savedRecord = await prisma.translation.create({
      data: {
        sourceLang,
        targetLang,
        originalText,
        translatedText,
      },
    });

    return NextResponse.json({ success: true, record: savedRecord }, { status: 200 });
  } catch (error: any) {
    console.error("Database save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save conversation to history" },
      { status: 500 }
    );
  }
}