# Ohoshisama STOR

Stor is a Vue 3 + TypeScript calculator that parses and evaluates s-expressions[^1] written in prefix notation, like `(+ 1 2)`, with a history of previously evaluated expressions.

[^1]: An S-expression (or symbolic expression, abbreviated as sexpr or sexp) is an expression in a like-named notation for nested list (tree-structured) data. See [Wikipedia](https://en.wikipedia.org/wiki/S-expression).

## Design

- Supports the binary operators `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `^` (exponentiate), and `%` (modulo)
- Each operand can itself be a nested s-expression instead of a number, e.g. `(* (+ 1 2) 3)` evaluates `(+ 1 2)` first, then multiplies the result by `3`
- Evaluation history showing each expression alongside its result
- Error handling for malformed input (unbalanced parentheses, invalid atoms, division by zero, etc.)
- Assumption: the operator is always the first atom in an s-expression, followed by exactly two numbers
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
npm run test
```

## Project Setup

Generated with `npm create vite@latest . -- --template vue-ts`, using Vue 3 `<script setup>` SFCs. See the [Vue docs](https://vuejs.org/guide/typescript/overview.html#project-setup) for setup and IDE support.
