# Ohoshisama STOR

Stor is a Vue 3 + TypeScript calculator that parses and evaluates s-expressions[^1] written in prefix notation, like `(+ 1 2)`, with a history of previously evaluated expressions.

**Live demo: [ohoshisama.chairulakmal.com](https://ohoshisama.chairulakmal.com/)**

## Design

- Six binary operators: `+` `-` `*` `/` `^` (exponentiate) `%` (modulo)
- Operands can be nested s-expressions, e.g. `(* (+ 1 2) 3)` evaluates the inner sum first
- Every operator takes exactly two operands — no unary or variadic forms (`(- 5)`, `(+ 1 2 3)` are invalid)
- History: last 8 evaluated expressions and results, persisted to `localStorage`. Malformed/corrupt entries (e.g. from a manually edited storage value) are dropped on load rather than crashing the app
- Clicking a history entry recalls it into the input with its already-known result, without re-evaluating
- Resubmitting an expression that matches the top of history doesn't add a duplicate — it shows a "already saved" hint instead
- Clearing history requires a confirm step
- The examples panel (docs modal's worked examples, also shown inline once history is empty) loads and evaluates an example without committing it to history until it's resubmitted or hand-edited
- Parser throws descriptive errors on unbalanced parens, unknown/missing operators, non-numeric operands, or wrong operand count
- Errors quote the offending token (`Invalid number "foo"`) rather than reporting a character position — inputs are short one-liners in a single field, so the quoted token locates the problem on its own
- Expression nesting is capped at 1000 levels deep, failing with a clear error instead of overflowing the call stack
- Operands: integers, negatives, decimals (`.5`, `5.`), and scientific notation (`1e3`, `2e-1`). `0x`/`0b`/`0o` literals are rejected explicitly, since `Number()` would otherwise silently accept them
- Whitespace-insensitive around parens and tokens
- Lisp-style `;` line comments are stripped before tokenizing — s-expressions come from the Lisp family, where `;` comments are ubiquitous, so an example pasted with its annotation (`(+ 1 2) ; Expected result: 3`) still evaluates
- Arithmetic runs in full double precision; only the _displayed_ result is rounded to 12 significant figures, so float noise like `(+ 0.1 0.2)` shows `0.3` instead of `0.30000000000000004`. Internal/history values stay unrounded. Very large or small magnitudes fall back to exponential notation
- Div/mod by zero and other undefined results (e.g. negative base with fractional exponent) throw instead of returning `Infinity`/`NaN`
- Evaluation happens on explicit submit — Enter, Calculate, or blur — rather than per keystroke, per NN/g's guidance against validating before the user finishes input[^2]. Blur commits to history like Enter/Calculate does, except for an untouched example, which only commits on explicit submit
- The parsed expression tree is evaluated with a post-order depth-first traversal — both operands are computed before their operator is applied, so nested expressions reduce bottom-up from the leaves
- Engine (tokenizer → parser → evaluator) is framework-free TypeScript in `src/lib/`, unit tested in isolation. Vue is just the UI shell around it.

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run unit tests for the core engine:

```bash
npm test
```

## Project Setup

Generated with `npm create vite@latest . -- --template vue-ts`, using Vue 3 `<script setup>` SFCs. See the [Vue docs](https://vuejs.org/guide/typescript/overview.html#project-setup) for setup and IDE support.

[^1]: A notation for representing nested list data as parenthesized expressions. See [Wikipedia](https://en.wikipedia.org/wiki/S-expression).

[^2]: On-change (live, per-keystroke) validation flags input as wrong before the user has finished typing it. See the Nielsen Norman Group's guidance on inline validation timing, e.g. [10 Design Guidelines for Reporting Errors in Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/).
