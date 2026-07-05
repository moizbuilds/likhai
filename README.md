# لکھائی Likhai

**Roman Urdu in. Real Urdu out. Then put it on a truck.**

Millions of people type Urdu in Latin letters every day — "kya haal hai" — because typing اردو is hard. Likhai converts Roman Urdu into proper Urdu script (real Nastaliq, grammar fixed), and then lets you render your line the way Urdu one-liners have always been published: painted on the back of a Pakistani truck. App #15 of my [30-in-30 challenge](https://www.linkedin.com/in/moiz-rana-b96a9072).

## The benchmark

This isn't just a wrapper — it's an honest evaluation. Two engines implement the same interface:

| Engine | Word accuracy | CER | Refusals |
|---|---|---|---|
| Dictionary baseline (982 mappings) | 68% | 0.339 | 1 |
| Claude (`claude-sonnet-5`) | **96%** | **0.005** | 0 |

Measured on a 60-sentence test set spanning clean text, chaotic spellings ("mje ni pta yr"), slang, code-switching, and poetry — with hand-verified references and orthographic normalization (punctuation/diacritics stripped, پتہ = پتا). Reproduce it: `npm run eval`. Live results at `/benchmark`.

## How it works

- **SvelteKit + TypeScript** on Vercel; Svelte 5 runes for reactivity.
- **Strategy pattern:** both engines implement `ConversionEngine`; the app, API route, and eval harness never know which one they're talking to.
- **The Claude engine is a prompt**, engineered for chaotic Roman Urdu spellings and code-switching, with dependency-injected clients so tests never touch the network.
- **Cards are real DOM, not AI-generated text.** Image models garble Nastaliq letter-joining, so the truck-art backgrounds are hand-built CSS/SVG (phool patti frames, chamak patti tape, jhalar valance) and the browser's own text renderer sets the Urdu — then `html-to-image` snapshots it to PNG.
- **Corpus with consent:** an opt-in checkbox (default off) saves anonymous Roman↔Urdu pairs to Turso (edge SQLite) — the seed of an open Urdu dataset.

## Run it

```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY; TURSO_DATABASE_URL=file:local.db works for dev
npm run migrate        # create the corpus table
npm run dev
```

`npm test` for unit tests, `npm run eval` to reproduce the benchmark.

## Privacy

Nothing is stored unless you tick the consent box. Consented pairs are anonymous — text only, no IPs, no accounts.
