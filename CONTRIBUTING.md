# Contributing

Thanks for your interest! Here's how to get involved.

## Adding a new exercise type

1. Add a new prompt builder in `lib/ollama.ts` — follow the pattern of `buildGeneratePrompt`
2. Add a new API route in `app/api/` if the exercise type needs a different generate/check flow
3. Add the exercise type as an option in the UI (`app/page.tsx`)
4. Open a PR with a brief description of what the exercise type teaches

## Adding a new LLM provider

1. Create a new file `lib/<provider>.ts` with a `chat(prompt: string): Promise<string>` function
2. Update the API routes to pick the provider via an env variable (e.g. `LLM_PROVIDER=openai`)
3. Document the new env variable in `.env.example` and `README.md`

## Code style

- TypeScript strict mode
- No external UI libraries — keep the dependency footprint tiny
- Prompt templates live in `lib/ollama.ts` (or the provider file), never inline in route handlers
