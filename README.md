# Ohoshisama STAR (S-Expression Calculator)

Star is a Vue 3 + TypeScript calculator that parses and evaluates [s-expressions](https://en.wikipedia.org/wiki/S-expression), with a history of previously evaluated expressions.

## Features

- Input and evaluate s-expressions like `(* (+ 1 2) 3)`
- Supports addition (`+`), subtraction (`-`), multiplication (`*`), division (`/`), exponentiation (`^`), and modulo (`%`)
- Operators are prefix and binary (exactly two operands, which may themselves be nested expressions)
- Evaluation history showing each expression alongside its result
- Error handling for malformed input (unbalanced parentheses, invalid atoms, division by zero, etc.)

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

## Architecture

The s-expression engine (tokenizer → parser → evaluator) lives in `src/lib/` as plain TypeScript, independent of Vue, so it can be unit tested in isolation. The Vue layer is a thin UI on top: an input field, an evaluate action, and a list rendering the history.

## Project Setup

This project was generated with:

```bash
npm create vite@latest . -- --template vue-ts
```

This template uses Vue 3 `<script setup>` SFCs. See the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more, and the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup) for recommended project setup and IDE support.
