import { NextRequest, NextResponse } from "next/server"
import { ollamaChat, buildCheckPrompt } from "@/lib/ollama"

export async function POST(req: NextRequest) {
  try {
    const { sentence, answer, userAnswer } = await req.json()

    if (!sentence || !answer || userAnswer === undefined) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 })
    }

    const raw = await ollamaChat(buildCheckPrompt(sentence, "____", answer, userAnswer), 0.1)
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("No JSON found in response")
    const result = JSON.parse(match[0])

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("[/api/check]", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}