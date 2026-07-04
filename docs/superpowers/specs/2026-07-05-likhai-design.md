# Likhai (لکھائی) — Design Spec

**Date:** 2026-07-05
**Build:** #15 of Moiz's 30-in-30 challenge
**One line:** Paste Roman Urdu, get flawless Urdu script in real Nastaliq, put it on the back of a Pakistani truck, and (with consent) grow an open Urdu corpus — with a public benchmark comparing a dictionary baseline against Claude.

## Product

### The flow

1. User lands on a single page styled as a truck-art object (see Visual Identity). One input panel, framed like a truck's name-plate. They type or paste Roman Urdu ("zindagi mein kuch karna hai to").
2. Conversion fires on a ~800ms debounce after typing stops. The Urdu script (زندگی میں کچھ کرنا ہے تو) fades in below, large, in proper Nastaliq typography. Grammar and spelling are normalized, not just transliterated.
3. Actions: **Copy** and the primary CTA **"ٹرک پہ لگا دو" (Truck pe laga do)**.
4. The CTA opens the **card studio**: the user's line rendered in Nastaliq on the tailgate of an illustrated truck, with 4–6 selectable art themes (e.g., rose panel, peacock, chamak patti mosaic, night-lights truck). Download as PNG sized for WhatsApp/Instagram/LinkedIn.
5. A small consent checkbox near the result: "Add this conversion (anonymously) to an open Urdu language dataset." Checked → the Roman↔Urdu pair is stored. Unchecked (default) → nothing is stored, ever.
6. A public **/benchmark** page shows both conversion engines scored against a curated eval set, with real numbers and a truck-art-styled chart.

### Why truck art

The tailgate of a Pakistani truck is the historical home of exactly this content: bold Nastaliq one-liners ("دیکھ مگر پیار سے"). "Truck pe laga do" is not a skin; it is the culturally correct place for the user's words to land.

## Visual identity

- The app is a **designed truck-art object, not a decorated website**. Deep lacquered background (midnight blue/black, truck-cab-at-night); all content lives in **panelized frames** with phool patti borders — mirroring how every truck surface is a bordered rectangle. Chamak patti geometric tape-work as accent dividers.
- **Palette:** emerald green, canary yellow, saturated red, electric blue, magenta — always separated by white/black outlines. Restraint comes from spacing and hierarchy, not desaturation.
- **Typography:** Urdu output in **Noto Nastaliq Urdu** (Google Fonts, well-hinted, reliable shaping); switch to Gulzar only if Noto's rendering disappoints in the card studio. Latin text in a distinctive non-default face. No system-font defaults.
- **Art pipeline (hybrid):**
  - AI-generated showpieces (truck-back illustration, card background paintings) are generated **once during the build**, curated by hand, and shipped as static assets. No runtime image generation.
  - SVG for repeating chrome: border patterns, scallops, dividers, small motifs — crisp at any size, recolorable per theme.
  - **Text is always real fonts rendered by the browser**, layered over the art, then snapshotted to PNG via `html-to-image`. AI image models cannot render Nastaliq reliably; text never gets baked into generated images.

## Architecture

```
SvelteKit app (Vercel)
│
├── /            Converter page + card studio
├── /benchmark   Public eval results
│
├── /api/convert   +server.ts → Claude API (key server-side only)
├── /api/corpus    +server.ts → Turso (consented pairs)
│
└── src/lib/engines/
    ├── types.ts        ConversionEngine interface
    ├── claude.ts       Engine 1: prompt-engineered Claude call (claude-sonnet-5)
    └── dictionary.ts   Engine 2: baseline (~500 word mappings, longest-match-first)
```

### Key decisions

- **Framework: SvelteKit** (deliberately new for Moiz after Next.js — compiler-based reactivity, built-in transitions suit an animation-heavy app). Deployed on Vercel.
- **Two engines behind one interface** (`convert(roman: string): Promise<ConversionResult>`, where `ConversionResult` is `{ ok: true, urdu: string } | { ok: false, reason: 'not_roman_urdu' | 'engine_error' }`), the strategy pattern. The app uses Claude for real conversions; the eval harness runs both without knowing which is which. The dictionary engine exists to make Claude's score meaningful, not to win.
- **Claude engine:** `claude-sonnet-5` via a SvelteKit server route. Prompt handles transliteration + grammar normalization + chaotic Roman spellings ("nhi"/"nai"/"nahin") + code-switching. API key in an env var; never in the browser.
- **Database: Turso** (edge-hosted SQLite; deliberately new tech #2). One table `corpus_pairs`: `id, roman_text, urdu_text, engine, created_at`. No accounts, no personal data; consent is per-conversion and anonymous.

## Eval set & benchmark

- `eval/testset.json`: ~60 Roman Urdu sentences with hand-verified Urdu references, spanning difficulty tiers: clean text, chaotic spellings, slang, code-switching ("yaar kal meeting hai"), poetry.
- A script runs both engines over the set and scores: **character error rate** (normalized edit distance vs reference) and **word accuracy**. Results written to a committed JSON file; `/benchmark` renders them as a styled chart with per-tier breakdown.
- Purpose: an honest, reproducible "baseline vs LLM" benchmark — the FDE portfolio artifact.

## Error handling & guardrails

- Claude API failure → clear error state with retry; **never** silently fall back to the dictionary engine.
- Empty/gibberish/non-Urdu input → the prompt instructs Claude to return a structured "not Roman Urdu" signal; UI shows a friendly message.
- `/api/convert` is rate-limited and input-length-capped (it spends money).
- `/api/corpus` validates inputs server-side; rejects when consent flag is absent.
- Secrets fail closed: missing env vars stop the server route with a clear error, no degraded fake output.

## Build phases

1. **Scaffold + engine core** — SvelteKit project, engine interface, Claude engine, `/api/convert`. *(Learning: SvelteKit basics, strategy pattern.)*
2. **Converter UI** — truck-art design system, live debounced conversion. *(Learning: Svelte reactivity, transitions.)*
3. **Card studio** — AI art generation + curation, themes, PNG export via `html-to-image`.
4. **Corpus** — Turso setup, consent flow, `/api/corpus`. *(Learning: SQLite/edge DBs.)*
5. **Eval + benchmark** — test set, scoring script, `/benchmark` page.
6. **Polish, test, deploy** — Playwright tests via `superpowers:webapp-testing`, pre-flight checklist, Vercel deploy, LinkedIn post.

`/code-review` runs after every phase, per Moiz's standard process.

## Out of scope (v1)

- User accounts, history, saved cards.
- Urdu → Roman (reverse direction).
- Punjabi support (future ambition; schema doesn't preclude it).
- Runtime AI image generation per card.
- Corpus browsing/export UI (the data accrues; tooling comes later).
