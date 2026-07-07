# Ohoshisama STOR

Stor is a Vue 3 + TypeScript calculator that parses and evaluates s-expressions[^1] written in prefix notation, like `(+ 1 2)`, with a history of previously evaluated expressions.

[^1]: A notation for representing nested list data as parenthesized expressions. See [Wikipedia](https://en.wikipedia.org/wiki/S-expression).

## Design

- Supports six binary operators: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `^` (exponentiate), and `%` (modulo)
- Operands can themselves be nested s-expressions instead of plain numbers, e.g. `(* (+ 1 2) 3)` evaluates `(+ 1 2)` first, then multiplies the result by `3`
- Every operator takes exactly two operands — no unary or variadic forms (e.g. `(- 5)` and `(+ 1 2 3)` are both invalid)
- Keeps a history of evaluated expressions alongside their results
- Parsing validates the input and throws a descriptive error on unbalanced parentheses, unknown operators, non-numeric operands, or the wrong number of operands
- Operands must be plain decimal numbers — hexadecimal (`0x`), binary (`0b`), and octal (`0o`) literals are rejected
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
