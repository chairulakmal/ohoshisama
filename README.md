# Ohoshisama STOR

Stor is a Vue 3 + TypeScript calculator that parses and evaluates s-expressions[^1] written in prefix notation, like `(+ 1 2)`, with a history of previously evaluated expressions.

**Live demo: [ohoshisama.chairulakmal.com](https://ohoshisama.chairulakmal.com/)**

## Design

### Language

- Six binary operators: `+` `-` `*` `/` `^` (exponentiate) `%` (modulo)
- Operands can be nested s-expressions, so `(* (+ 1 2) 3)` evaluates the inner sum first
- Every operator takes exactly two operands. There are no unary or variadic forms, so `(- 5)` and `(+ 1 2 3)` are both invalid
- Operands can be integers, negatives, decimals (`.5`, `5.`), or scientific notation (`1e3`, `2e-1`). Hex, binary, and octal literals (`0x`, `0b`, `0o`) are rejected on purpose, because `Number()` would otherwise accept them silently
- Whitespace around parens and tokens doesn't matter
- Lisp-style `;` line comments are stripped before tokenizing. S-expressions come from the Lisp family, where `;` comments are everywhere, so an example pasted with its annotation like `(+ 1 2) ; Expected result: 3` still evaluates

### Engine

- The engine (tokenizer, parser, evaluator) is framework-free TypeScript in `src/lib/`, unit tested on its own. Vue is just the UI shell around it
- The parsed expression tree is evaluated with a post-order depth-first traversal. Both operands are computed before their operator runs, so nested expressions reduce from the leaves up
- Nesting is capped at 1000 levels deep. Past that it fails with a clear error instead of overflowing the call stack
- Arithmetic runs in full double precision, and only the _displayed_ result is rounded to 12 significant figures. That way float noise like `(+ 0.1 0.2)` shows `0.3` instead of `0.30000000000000004`, while the values kept internally and in history stay unrounded. Very large or small magnitudes fall back to exponential notation
- Dividing or taking a modulo by zero, and other undefined results like a negative base with a fractional exponent, throw an error instead of returning `Infinity` or `NaN`

### Errors

- The parser throws descriptive errors for unbalanced parens, unknown or missing operators, non-numeric operands, and the wrong number of operands
- Errors quote the offending token, like `Invalid number "foo"`, instead of reporting a character position. Inputs are short one-liners in a single field, so the quoted token is enough to find the problem

### History and input

- Evaluation happens when you submit, whether by Enter, Calculate, or clicking away, rather than on every keystroke. This follows NN/g's guidance against flagging input before the user has finished typing[^2]. Clicking away commits to history the same as Enter or Calculate, except for an untouched example, which only commits once you actually submit it
- History keeps the last 8 expressions and their results in `localStorage`. Malformed or corrupt entries, say from a hand-edited storage value, are dropped on load rather than crashing the app
- Clicking a history entry brings it back into the input with its known result, without re-evaluating
- Resubmitting an expression that already sits at the top of history won't add a duplicate. It shows an "already saved" hint instead
- Clearing history takes a confirm step
- The examples panel (the docs modal's worked examples, also shown inline when history is empty) loads and evaluates an example without saving it to history until you resubmit or edit it

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
