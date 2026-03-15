# 🇪🇸 Spanish AI Exercise Maker

AI-powered fill-in-the-blank Spanish exercises. You give it the words you want to practise, it generates exercises and grades your answers — all running locally with [Ollama](https://ollama.com).

## Features (v0.1)

- Enter any Spanish vocabulary words
- AI generates a fill-in-the-blank sentence using one of your words
- Type your answer and get instant AI feedback
- Fully local — no API keys, no data sent to the cloud

## Stack

- **Next.js 14** — frontend + API routes in one
- **Ollama** — runs the LLM locally (default: `llama3`)
- **TypeScript**

## Quick start

### 1. Install and start Ollama

```bash
# Install from https://ollama.com, then:
ollama pull llama3
```

### 2. Clone and install

```bash
git clone https://github.com/your-username/spanish-ai-exercises
cd spanish-ai-exercises
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local if you want a different model or Ollama URL
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3` | Any model you have pulled |

Other models that work well: `mistral`, `phi3`, `gemma2`.

## Project structure

```
app/
  page.tsx              # Main UI (all phases: input → exercise → result)
  layout.tsx            # Root layout + fonts
  globals.css           # Design tokens
  api/
    generate/route.ts   # POST /api/generate — creates an exercise
    check/route.ts      # POST /api/check    — grades the answer
lib/
  ollama.ts             # Ollama client + prompt templates
```

## Roadmap

- [x] v0.1 — Fill-in-the-blank, Ollama, single page
- [ ] v0.2 — Multiple exercise types (translation, sentence builder, multiple choice)
- [ ] v0.3 — Session progress tracking
- [ ] v1.0 — Shareable exercise sets, mobile polish

## Contributing

Pull requests welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licence

MIT
