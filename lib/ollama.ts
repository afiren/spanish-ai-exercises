// lib/ollama.ts
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434"
const MODEL = process.env.OLLAMA_MODEL ?? "llama3"

export async function ollamaChat(prompt: string, temperature = 0.3): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature,   // #4 — lower = less hallucination
        top_p: 0.85,   // #4 — more deterministic output
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ollama error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.response as string
}

// ─── Prompt templates ────────────────────────────────────────────────────────

export function buildGeneratePrompt(words: string[]): string {
  return `You are an expert Spanish language teacher with 20 years of experience. Your job is to create fill-in-the-blank exercises that use correct, standard Spanish grammar. Never invent verbs or conjugations. Only use standard Spanish.

The student wants to practise these Spanish words: ${words.join(", ")}

Few-shot examples of perfect exercises:
- Word "hablar": { "sentence": "Me gusta ____ con mis amigos.", "answer": "hablar", "hint": "I like to talk with my friends.", "word": "hablar" }
- Word "comer":  { "sentence": "Ella suele ____ fruta por la mañana.", "answer": "comer", "hint": "She usually eats fruit in the morning.", "word": "comer" }
- Word "vivir":  { "sentence": "Nosotros queremos ____ cerca del mar.", "answer": "vivir", "hint": "We want to live near the sea.", "word": "vivir" }

Now create ONE exercise following those examples exactly. Rules:
1. Pick ONE word from: ${words.join(", ")}
2. Write a grammatically correct Spanish sentence using that word.
3. Replace that word with ____ — it must have at least one word before AND after it.
4. NEVER put ____ at the start or end of the sentence.
5. Use only standard, commonly used Spanish.

Step-by-step reasoning before answering:
- Which word am I picking and why?
- What is a natural sentence using that word?
- Does ____ appear in the middle of the sentence?
- Is the grammar correct?

After reasoning, output ONLY this JSON (no markdown fences, no extra text):
{
  "sentence": "sentence with ____ in the middle",
  "answer": "the missing word",
  "hint": "English translation of the full sentence",
  "word": "the word being practised"
}`.trim()
}

export function buildReviewPrompt(exercise: {
  sentence: string
  answer: string
  hint: string
  word: string
}): string {
  return `You are a strict Spanish grammar checker. Review this fill-in-the-blank exercise and fix any issues.

Exercise to review:
- Sentence: "${exercise.sentence}"
- Answer: "${exercise.answer}"
- Hint: "${exercise.hint}"

Check:
1. Is the Spanish grammar correct?
2. Does ____ appear in the middle of the sentence (not at start or end)?
3. Is the answer a real, standard Spanish word?
4. Is the hint an accurate English translation?

If everything is correct, return it unchanged.
If there are issues, fix them and return the corrected version.

Output ONLY valid JSON, no markdown fences:
{
  "sentence": "...",
  "answer": "...",
  "hint": "...",
  "word": "${exercise.word}"
}`.trim()
}

export function buildCheckPrompt(
  sentence: string,
  blank: string,
  correctAnswer: string,
  userAnswer: string
): string {
  return `You are an expert Spanish language teacher grading a student's answer.

Exercise sentence: "${sentence}"
Correct answer: "${correctAnswer}"
Student's answer: "${userAnswer}"

Step-by-step reasoning:
- Is the student's answer the same word (ignoring accents and capitalisation)?
- If different, is it a valid alternative that fits the sentence grammatically?

Rules:
- Accept minor accent differences (e.g. "hablo" vs "habló" only if context allows).
- Accept correct capitalisation variations.
- Do NOT accept wrong tense or a different word.

Output ONLY valid JSON, no markdown fences:
{
  "correct": true or false,
  "explanation": "one friendly sentence — encouragement if correct, brief grammar tip if wrong"
}`.trim()
}