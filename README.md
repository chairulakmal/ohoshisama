# Ohoshisama STOR

Stor is a Tanabata-themed calculator for [s-expressions](https://en.wikipedia.org/wiki/S-expression): arithmetic written in prefix notation, like `(+ 1 2)`, parsed and evaluated by a framework-free TypeScript engine in [src/lib/](src/lib), with Vue 3 as nothing more than the shell around it. Below: the live demo, the language rules, the highlights, the stack, how to run it locally, and how it is tested; [ARCHITECTURE.md](ARCHITECTURE.md) walks the design decisions.

**Live demo: [ohoshisama.chairulakmal.com](https://ohoshisama.chairulakmal.com/)**

## The language

- Six binary operators: `+` `-` `*` `/` `^` (exponentiate) `%` (modulo).
- Operands can be nested s-expressions, so `(* (+ 1 2) 3)` evaluates the inner sum first.
- Every operator takes exactly two operands. There are no unary or variadic forms, so `(- 5)` and `(+ 1 2 3)` are both invalid.
- `%` and `^` follow JavaScript's `%` and `**` semantics: `%` is a remainder whose sign follows the dividend (so `(% -7 3)` is `-1`, not the Euclidean `2`), and `^` allows fractional and negative exponents. A negative base with a fractional exponent is undefined (`NaN`) and is rejected rather than returned.
- Operands can be integers, negatives, decimals (`.5`, `5.`), or scientific notation (`1e3`, `2e-1`). Hex, binary, and octal literals (`0x`, `0b`, `0o`) are rejected on purpose, because `Number()` would otherwise accept them silently.
- Whitespace around parens and tokens doesn't matter, and Lisp-style `;` line comments are stripped before tokenizing, so an example pasted with its annotation, like `(+ 1 2) ; Expected result: 3`, still evaluates.

## Highlights

- The whole engine, tokenizer, recursive-descent parser, and evaluator, is framework-free TypeScript in [src/lib/evaluator.ts](src/lib/evaluator.ts): about 160 lines that read top to bottom, with no Vue import anywhere in `src/lib/`. The parsed tree is evaluated with a post-order depth-first traversal, so nested expressions reduce from the leaves up, and the unit tests exercise the engine directly with no DOM.
- The parser is strict where JavaScript is loose. Non-decimal literals are rejected before `Number()` gets a chance to accept them, and division by zero, modulo by zero, overflow to `Infinity`, and `NaN` results all throw descriptive errors instead of leaking sentinel values into history. Errors quote the offending token, like `Invalid number "foo"`, because inputs are short one-liners where the quoted token is enough to find the problem.
- Nesting is capped at 1000 levels, so a pathologically deep input fails with a clear message instead of blowing the recursion stack with a raw `RangeError`; [src/lib/evaluator.test.ts](src/lib/evaluator.test.ts) proves it with a 100,000-level expression.
- Adding an operator without handling it is a compile error: the evaluation switch is exhaustive over the `Operator` union with no default case, and the operator list quoted in error messages is derived from the same `OPERATORS` array, so the code and its errors can never drift apart. The compiler also runs with `noUncheckedIndexedAccess` ([tsconfig.app.json](tsconfig.app.json)), which forces every token read past the end of input to be handled explicitly.
- Arithmetic runs in full double precision and only the displayed string is rounded, to 12 significant figures in [src/lib/format.ts](src/lib/format.ts), so `(+ 0.1 0.2)` shows `0.3` instead of `0.30000000000000004` while history keeps the raw value. Integers bypass the rounding so a large exact integer is never corrupted, and a negative zero result like `(* -1 0)` displays as `0`.
- Evaluation happens when you submit, whether by Enter, Calculate, or clicking away, rather than on every keystroke, following [NN/g's guidance](https://www.nngroup.com/articles/errors-forms-design-guidelines/) against flagging input before the user has finished typing. [src/composables/useCalculator.ts](src/composables/useCalculator.ts) also tracks whether the box holds an untouched example, so clicking through the worked examples shows each result without polluting history.
- History keeps the last 8 evaluations in `localStorage` with a validating load in [src/composables/useHistory.ts](src/composables/useHistory.ts): malformed or hand-edited entries are dropped rather than crashing the app, resubmitting the top entry shows an "already saved" hint instead of stacking a duplicate, and clearing takes a confirm step.

## Stack

| Layer | What the code pins |
|---|---|
| UI | Vue 3.5.39, `<script setup>` SFCs, TypeScript 6.0.3 |
| Build | Vite 8.1.3, with vue-tsc 3.3.6 type-checking the build |
| Tests | Vitest 4.1.10, unit suites over the engine only |
| Lint and format | ESLint 10.6.0 (flat config), Prettier 3.9.4 |
| Hosting | Cloudflare Workers static assets ([wrangler.jsonc](wrangler.jsonc)), SPA fallback |

## Running locally

Prerequisites: Node 20.19+ (what Vite 8 requires) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Dev server (Vite prints the local URL, default localhost:5173)
npm run dev

# 3. Engine unit tests
npm test

# 4. The full local gate: typecheck, lint, format, tests
npm run check

# 5. Production build to dist/
npm run build
```

`npm run deploy` builds and publishes `dist/` with `npx wrangler deploy`; it needs a Cloudflare account and is only for deploying the live site.

## Testing

Two Vitest suites cover the engine, and only the engine; there is no CI, so `npm run check` is the local gate. [src/lib/evaluator.test.ts](src/lib/evaluator.test.ts) is table-driven over the spec's worked examples, tokenizer behavior (whitespace, scientific notation, comment stripping), the parse trees themselves, every parser error path, and the depth cap. [src/lib/format.test.ts](src/lib/format.test.ts) covers the display rounding: float artifacts collapsing, integers rendered verbatim, negative zero, and exponential fallback for extreme magnitudes.

## Architecture

[ARCHITECTURE.md](ARCHITECTURE.md) walks through the decisions with file paths: the framework-free engine, the hand-rolled recursive-descent parser and its guardrails, rejecting what JavaScript would quietly accept, computing in full precision while rounding only the display, submit-time evaluation with history that knows what it owns, and shipping as static assets on a Cloudflare Worker. Each section states the choice, the reasoning, and the trade-off accepted.

## Project setup

Generated with `npm create vite@latest . -- --template vue-ts`, using Vue 3 `<script setup>` SFCs. See the [Vue docs](https://vuejs.org/guide/typescript/overview.html#project-setup) for setup and IDE support.
