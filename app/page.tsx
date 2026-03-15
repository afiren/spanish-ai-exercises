"use client"

import { useState, useRef, useEffect } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  sentence: string
  answer: string
  hint: string
  word: string
}

interface CheckResult {
  correct: boolean
  explanation: string
}

type Phase = "input" | "exercise" | "result"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SentenceDisplay({ sentence, userAnswer, phase }: {
  sentence: string
  userAnswer: string
  phase: Phase
}) {
  const parts = sentence.split("____")
  return (
    <p style={{ fontSize: "1.5rem", lineHeight: 1.7, fontFamily: "Fraunces, serif", color: "var(--text)" }}>
      {parts[0]}
      <span style={{
        display: "inline-block",
        minWidth: 120,
        borderBottom: phase === "exercise" ? "2.5px solid var(--accent)" : "none",
        padding: "0 6px 2px",
        color: phase === "result" ? "var(--accent)" : "var(--text)",
        fontWeight: 600,
        fontStyle: "italic",
      }}>
        {phase === "result" ? userAnswer || "…" : (userAnswer || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0")}
      </span>
      {parts[1]}
    </p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const [wordInput, setWordInput] = useState("")
  const [phase, setPhase] = useState<Phase>("input")
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const answerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (phase === "exercise") answerRef.current?.focus()
  }, [phase])


const words = wordInput
  .split(/[\n,]+/)
  .map(w => w.trim())
  .filter(Boolean)
  async function handleGenerate() {
    const words = wordInput
      .split(/[\n,]+/)
      .map(w => w.trim())
      .filter(Boolean)
    if (words.length === 0) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate")
      setExercise(data)
      setUserAnswer("")
      setCheckResult(null)
      setPhase("exercise")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleCheck() {
    if (!exercise || !userAnswer.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence: exercise.sentence,
          answer: exercise.answer,
          userAnswer: userAnswer.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to check")
      setCheckResult(data)
      setPhase("result")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    setPhase("exercise")
    setUserAnswer("")
    setCheckResult(null)
    handleGenerate()
  }

  function handleReset() {
    setPhase("input")
    setExercise(null)
    setUserAnswer("")
    setCheckResult(null)
    setError("")
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main style={{ maxWidth: 640, margin: "0 auto" }}>

      {/* Header */}
      <header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "var(--accent)", color: "#fff",
          borderRadius: 999, padding: "4px 16px 4px 10px",
          fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: "1rem", fontWeight: 500,
        }}>
          <span style={{ fontSize: 16 }}>🇪🇸</span> AI Exercise Maker
        </div>
        <h1 style={{ fontSize: "2.25rem", lineHeight: 1.15, color: "var(--text)" }}>
          Practise your<br />
          <em style={{ color: "var(--accent)" }}>Spanish vocabulary</em>
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "0.6rem", fontSize: "0.95rem" }}>
          Powered by Ollama · running fully on your machine
        </p>
      </header>

      {/* ── Phase: INPUT ─────────────────────────────────────────────────── */}
      {phase === "input" && (
        <Card>
          <label style={labelStyle}>
            Your vocabulary words
            <span style={{ color: "var(--muted)", fontSize: "0.8rem", fontWeight: 400, marginLeft: 8 }}>
              separate with commas or new lines
            </span>
          </label>
          <textarea
            value={wordInput}
            onChange={e => setWordInput(e.target.value)}
            placeholder={"hablar, comer, vivir\ncorrer, dormir"}
            rows={4}
            style={textareaStyle}
          />

          {words.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.25rem" }}>
              {words.map(w => (
                <span key={w} style={tagStyle}>{w}</span>
              ))}
            </div>
          )}

          {error && <ErrorBox message={error} />}

          <button
            onClick={handleGenerate}
            disabled={loading || words.length === 0}
            style={primaryButtonStyle(loading || words.length === 0)}
          >
            {loading ? "Generating…" : "Generate exercise →"}
          </button>
        </Card>
      )}

      {/* ── Phase: EXERCISE ──────────────────────────────────────────────── */}
      {phase === "exercise" && exercise && (
        <Card>
          <div style={{ marginBottom: "0.5rem" }}>
            <WordBadge word={exercise.word} />
          </div>

          <div style={{
            background: "var(--bg)", borderRadius: 8,
            padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
            border: "1px solid var(--border)"
          }}>
            <SentenceDisplay sentence={exercise.sentence} userAnswer={userAnswer} phase="exercise" />
          </div>

          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            💡 {exercise.hint}
          </p>

          <label style={{ ...labelStyle, marginTop: "1rem" }}>Your answer</label>
          <input
            ref={answerRef}
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCheck()}
            placeholder="Type the missing word…"
            style={inputStyle}
            autoComplete="off"
          />

          {error && <ErrorBox message={error} />}

          <div style={{ display: "flex", gap: 10, marginTop: "0.5rem" }}>
            <button
              onClick={handleCheck}
              disabled={loading || !userAnswer.trim()}
              style={primaryButtonStyle(loading || !userAnswer.trim())}
            >
              {loading ? "Checking…" : "Check answer →"}
            </button>
            <button onClick={handleReset} style={ghostButtonStyle}>
              ← Change words
            </button>
          </div>
        </Card>
      )}

      {/* ── Phase: RESULT ────────────────────────────────────────────────── */}
      {phase === "result" && exercise && checkResult && (
        <Card>
          <div style={{ marginBottom: "0.75rem" }}>
            <WordBadge word={exercise.word} />
          </div>

          {/* Result banner */}
          <div style={{
            background: checkResult.correct ? "var(--green-light)" : "var(--accent-light)",
            border: `1px solid ${checkResult.correct ? "#b2dfca" : "#f5c2bb"}`,
            borderRadius: 10,
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>
              {checkResult.correct ? "✅" : "❌"}
            </span>
            <div>
              <p style={{
                fontWeight: 600,
                color: checkResult.correct ? "var(--green)" : "var(--accent)",
                marginBottom: 4,
              }}>
                {checkResult.correct ? "Correct!" : "Not quite"}
              </p>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {checkResult.explanation}
              </p>
            </div>
          </div>

          {/* Sentence with answer */}
          <div style={{
            background: "var(--bg)", borderRadius: 8,
            padding: "1.25rem 1.5rem", marginBottom: "1rem",
            border: "1px solid var(--border)"
          }}>
            <SentenceDisplay sentence={exercise.sentence} userAnswer={userAnswer} phase="result" />
          </div>

          {!checkResult.correct && (
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Correct answer: <strong style={{ color: "var(--text)" }}>{exercise.answer}</strong>
            </p>
          )}

          {error && <ErrorBox message={error} />}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleNext} disabled={loading} style={primaryButtonStyle(loading)}>
              {loading ? "Loading…" : "Next exercise →"}
            </button>
            <button onClick={handleReset} style={ghostButtonStyle}>
              ← Change words
            </button>
          </div>
        </Card>
      )}

      {/* Footer */}
      <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.75rem", marginTop: "2rem" }}>
        Open source · MIT licence ·{" "}
        <a href="https://github.com/your-username/spanish-ai-exercises"
          style={{ color: "var(--accent)", textDecoration: "none" }}>
          GitHub
        </a>
      </p>
    </main>
  )
}

// ─── Small components ─────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "1.75rem",
      boxShadow: "var(--shadow)",
    }}>
      {children}
    </div>
  )
}

function WordBadge({ word }: { word: string }) {
  return (
    <span style={{
      display: "inline-block",
      background: "var(--accent-light)",
      color: "var(--accent)",
      border: "1px solid #f5c2bb",
      borderRadius: 999,
      padding: "2px 12px",
      fontSize: "0.8rem",
      fontWeight: 500,
      letterSpacing: "0.04em",
    }}>
      {word}
    </span>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      background: "#fff5f5", border: "1px solid #fecaca",
      borderRadius: 8, padding: "0.75rem 1rem",
      color: "#b91c1c", fontSize: "0.85rem",
      marginBottom: "1rem",
    }}>
      ⚠️ {message}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 500,
  fontSize: "0.875rem",
  marginBottom: "0.5rem",
  color: "var(--text)",
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  fontFamily: "DM Sans, sans-serif",
  background: "var(--bg)",
  color: "var(--text)",
  resize: "vertical",
  marginBottom: "1rem",
  outline: "none",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  fontFamily: "DM Sans, sans-serif",
  background: "var(--bg)",
  color: "var(--text)",
  marginBottom: "1rem",
  outline: "none",
}

const tagStyle: React.CSSProperties = {
  background: "var(--accent-light)",
  color: "var(--accent)",
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: "0.8rem",
  fontWeight: 500,
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "#d1c9c0" : "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.15s",
  }
}

const ghostButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "var(--muted)",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  padding: "0.75rem 1.25rem",
  fontSize: "0.9rem",
  fontFamily: "DM Sans, sans-serif",
  cursor: "pointer",
}
