import { computed, onUnmounted, ref, watch } from 'vue'
import { evaluate } from '../lib/evaluator'
import { formatResult } from '../lib/format'
import type { HistoryEntry } from './useHistory'

type Evaluation = { result: number | null; error: string | null }

function evaluateExpression(expr: string): Evaluation {
  try {
    return { result: evaluate(expr), error: null }
  } catch (e) {
    return { result: null, error: e instanceof Error ? e.message : 'Invalid expression' }
  }
}

// auto-dismiss the duplicate hint so it doesn't linger indefinitely
const DUPLICATE_HINT_MS = 4000

// the slice of history state the calculator needs: push a result, and tell whether
// an expression already sits at the top (so a resubmit reads as "already saved")
type HistoryApi = {
  isTopEntry: (expression: string) => boolean
  addEntry: (expression: string, result: number) => void
}

// Owns the input expression, its evaluation, and the submit/blur/recall/example
// flows. Kept separate from the DOM: the textarea's autosize and focus live in
// CalculatorInput, which this composable never touches.
export function useCalculator(history: HistoryApi, initial = '(+ 1 (* 2 3))') {
  const expression = ref(initial)

  // only (re)computed on explicit submit (Enter / the Calculate button), not on every
  // keystroke — validating partially-typed expressions as invalid reads as premature
  // and flickers the error message and layout on each character
  const evaluation = ref<Evaluation>(evaluateExpression(expression.value))

  // full precision is kept in evaluation.result / history; only the displayed
  // string is rounded, so floating-point artifacts never surface to the user
  const displayResult = computed(() =>
    evaluation.value.result === null ? '' : formatResult(evaluation.value.result)
  )

  // show a prompt when the field is empty
  const isEmpty = computed(() => expression.value.trim() === '')
  const hasError = computed(() => evaluation.value.error !== null && !isEmpty.value)
  const canSubmit = computed(() => !isEmpty.value)

  // only true right after a submit finds the expression already at the top of
  // history — not right after the save that put it there — so the hint reads
  // as "you tried to save this again" rather than firing on every fresh save
  const isDuplicateSubmit = ref(false)
  let duplicateHintTimer: ReturnType<typeof setTimeout> | undefined

  function setDuplicateSubmit(value: boolean) {
    clearTimeout(duplicateHintTimer)
    isDuplicateSubmit.value = value
    if (value) {
      duplicateHintTimer = setTimeout(() => {
        isDuplicateSubmit.value = false
      }, DUPLICATE_HINT_MS)
    }
  }

  // true while the box holds an example the user clicked but hasn't run or edited —
  // keeps a bare click-/tab-away (blur) from committing it to history on its own
  let exprFromExample = false

  function submit() {
    evaluation.value = evaluateExpression(expression.value)
    const { result, error } = evaluation.value
    if (error || result === null) return
    if (history.isTopEntry(expression.value)) {
      setDuplicateSubmit(true)
      return
    }
    setDuplicateSubmit(false)
    exprFromExample = false
    history.addEntry(expression.value, result)
  }

  // blur commits by default (type an expression, click away, see it saved) — but not
  // for an untouched example the user merely clicked; that enters history only via an
  // explicit Enter / Calculate, or once they've hand-edited it (see onInput)
  function handleBlur() {
    if (exprFromExample) return
    submit()
  }

  // a hand-typed edit makes the box the user's own again, so a later blur may commit it
  function onInput() {
    exprFromExample = false
  }

  function recall(entry: HistoryEntry) {
    expression.value = entry.expression
    // the entry's result is already known — show it without requiring a resubmit
    evaluation.value = { result: entry.result, error: null }
    setDuplicateSubmit(false)
  }

  // load an example into the input and evaluate it inline, WITHOUT committing to
  // history — so a reviewer can click through every example and see its result while
  // the panel stays put. Only an explicit submit (Enter / Calculate / blur) commits.
  function runExample(expr: string) {
    expression.value = expr
    evaluation.value = evaluateExpression(expr)
    exprFromExample = true
    setDuplicateSubmit(false)
  }

  watch(expression, () => setDuplicateSubmit(false))

  onUnmounted(() => clearTimeout(duplicateHintTimer))

  return {
    expression,
    evaluation,
    displayResult,
    isEmpty,
    hasError,
    canSubmit,
    isDuplicateSubmit,
    submit,
    handleBlur,
    onInput,
    recall,
    runExample
  }
}
