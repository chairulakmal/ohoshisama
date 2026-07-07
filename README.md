# Ohoshisama STOR

Stor is a Vue 3 + TypeScript calculator that parses and evaluates s-expressions[^1] written in prefix notation, like `(+ 1 2)`, with a history of previously evaluated expressions.

[^1]: A notation for representing nested list data as parenthesized expressions. See [Wikipedia](https://en.wikipedia.org/wiki/S-expression).

## Design

- Supports six binary operators: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `^` (exponentiate), and `%` (modulo)
- Operands can themselves be nested s-expressions instead of plain numbers, e.g. `(* (+ 1 2) 3)` evaluates `(+ 1 2)` first, then multiplies the result by `3`
- Every operator takes exactly two operands — no unary or variadic forms (e.g. `(- 5)` and `(+ 1 2 3)` are both invalid)
- Keeps a history of the last 8 evaluated expressions alongside their results, saved to `localStorage` so it survives a reload
- Parsing validates the input and throws a descriptive, human-readable error on unbalanced parentheses, unknown or missing operators, non-numeric operands, or the wrong number of operands
- Operands accept plain decimal numbers only: integers, negatives, decimals (including leading/trailing-dot forms like `.5` and `5.`), and scientific notation (`1e3`, `2e-1`). Hexadecimal (`0x`), binary (`0b`), and octal (`0o`) literals are rejected, since `Number()` would otherwise silently accept them
- Whitespace around parentheses and between tokens is insensitive — `(+ 1 2)` and `(  +\n1\t2 )` parse identically
- Numbers are standard IEEE-754 doubles (JS `number`), so results can carry the usual floating-point imprecision (e.g. `(+ 0.1 0.2)` is `0.30000000000000004`, not an exact `0.3`)
- Division and modulo by zero, and any operation whose result overflows to `Infinity` or is otherwise undefined (e.g. a negative base with a fractional exponent), are rejected rather than silently returning `Infinity`/`NaN`
- The live result preview is debounced (500ms after the last keystroke) so the calculator doesn't flash an error on every partially-typed expression; pressing Enter or the Save button evaluates the current input immediately
- The s-expression engine (tokenizer → parser → evaluator) lives in `src/lib/` as plain TypeScript, independent of Vue, so it can be unit tested in isolation. Vue provides a thin UI on top: an input field, an evaluate action, and a history list.

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
