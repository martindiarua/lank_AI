import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "../../../lib/db";
import { decrypt } from "../../../lib/auth";

// Strict validation for incoming save requests
const savePhraseSchema = z.object({
  originalText: z.string().min(1, "Original text is required"),
  translatedText: z.string().min(1, "Translated text is required"),
  sourceLang: z.string(),
  targetLang: z.string(),
  category: z.string().default("All"),
  notes: z.string().optional(),
});

// Utility to extract the authenticated user ID from the secure session cookie
async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  
  try {
    const payload = await decrypt(sessionCookie);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

// GET: Fetch all saved phrases for the currently logged-in user
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const phrases = await db.savedPhrase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, // Newest phrases first
    });

    return NextResponse.json({ phrases }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch saved phrases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Save a new phrase to the database
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = savePhraseSchema.parse(body);

    const savedPhrase = await db.savedPhrase.create({
      data: {
        userId,
        originalText: data.originalText,
        translatedText: data.translatedText,
        sourceLang: data.sourceLang,
        targetLang: data.targetLang,
        category: data.category,
        notes: data.notes,
      },
    });

    return NextResponse.json({ success: true, phrase: savedPhrase }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Failed to save phrase:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}