// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { ollamaChat, buildGeneratePrompt } from "@/lib/ollama"

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json()

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: "Provide at least one word." }, { status: 400 })
    }

    const prompt = buildGeneratePrompt(words)
    const raw = await ollamaChat(prompt)

    // Strip any accidental markdown fences the model may add
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const exercise = JSON.parse(cleaned)

    return NextResponse.json(exercise)
  } catch (err: unknown) {
    console.error("[/api/generate]", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
