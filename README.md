# Ohoshisama STOR

Stor is a Vue 3 + TypeScript calculator that parses and evaluates s-expressions[^1] written in prefix notation, like `(+ 1 2)`, with a history of previously evaluated expressions.

## Design

- Supports six binary operators: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `^` (exponentiate), and `%` (modulo)
- Operands can themselves be nested s-expressions instead of plain numbers, e.g. `(* (+ 1 2) 3)` evaluates `(+ 1 2)` first, then multiplies the result by `3`
- Every operator takes exactly two operands — no unary or variadic forms (e.g. `(- 5)` and `(+ 1 2 3)` are both invalid)
- Keeps a history of the last 8 evaluated expressions alongside their results, saved to `localStorage` so it survives a reload
- Parsing validates the input and throws a descriptive, human-readable error on unbalanced parentheses, unknown or missing operators, non-numeric operands, or the wrong number of operands
- Operands accept plain decimal numbers only: integers, negatives, decimals (including leading/trailing-dot forms like `.5` and `5.`), and scientific notation (`1e3`, `2e-1`). Hexadecimal (`0x`), binary (`0b`), and octal (`0o`) literals are rejected, since `Number()` would otherwise silently accept them
- Whitespace around parentheses and between tokens is insensitive — `(+ 1 2)` and `(  +\n1\t2 )` parse identically
- Arithmetic runs in IEEE-754 doubles (JS `number`) at full precision, but the result is _displayed_ rounded to 12 significant figures, so binary floating-point artifacts don't surface — `(+ 0.1 0.2)` shows `0.3`, not `0.30000000000000004`. The unrounded value is what's kept internally (including in history); only the on-screen string is rounded. Twelve significant figures sits below the ~15–17 digits where double representation noise begins, so genuine results stay faithful. Very large or small magnitudes fall back to exponential notation, as on a handheld calculator
- Division and modulo by zero, and any operation whose result overflows to `Infinity` or is otherwise undefined (e.g. a negative base with a fractional exponent), are rejected rather than silently returning `Infinity`/`NaN`
- Expressions are evaluated on explicit submit — press Enter, click Calculate, or blur the field (click/tab away) — rather than live as you type, so partially-typed expressions never flash an error mid-keystroke. This follows the Nielsen Norman Group's guidance against on-change validation, which favors validating on blur or submit instead[^2]
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

[^1]: A notation for representing nested list data as parenthesized expressions. See [Wikipedia](https://en.wikipedia.org/wiki/S-expression).

[^2]: On-change (live, per-keystroke) validation flags input as wrong before the user has finished typing it. See the Nielsen Norman Group's guidance on inline validation timing, e.g. [Inline Validation in Forms: Design Guidelines](https://www.nngroup.com/articles/inline-validation-better-user-experience/).
