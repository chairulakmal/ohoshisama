<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import ohoshisama from '../assets/ohoshisama.svg'
import vueLogo from '../assets/vue.svg'
import { evaluate } from '../lib/evaluator'
import { formatResult } from '../lib/format'

const showDocs = ref(false)
const expression = ref('(+ 1 (* 2 3))')
const exprInput = ref<HTMLTextAreaElement | null>(null)

// the spec's worked examples, shown in the docs modal as one-click runnable
// checks — `expected` lets a reviewer verify the on-screen result at a glance
const EXAMPLES: { expr: string; expected: string }[] = [
  { expr: '(+ 1 2)', expected: '3' },
  { expr: '(- 5 3.5)', expected: '1.5' },
  { expr: '(/ (- 10 2) 4)', expected: '2' },
  { expr: '(* (+ 1 2) 3)', expected: '9' },
  { expr: '(+ (- 5 2) (* 3 7))', expected: '24' },
  { expr: '(* (+ (^ 3 4) (% 11 3)) (/ (- 15 5) 2))', expected: '415' }
]

type HistoryEntry = { id: number; expression: string; result: number }

const HISTORY_LIMIT = 8
const STORAGE_KEY = 'stor:history'

function loadHistory(): HistoryEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (e): e is HistoryEntry =>
          e != null &&
          typeof e.id === 'number' &&
          typeof e.expression === 'string' &&
          typeof e.result === 'number'
      )
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

const history = ref<HistoryEntry[]>(loadHistory())
// carry the id counter past whatever we restored so keys stay unique
let nextHistoryId = history.value.reduce((max, e) => Math.max(max, e.id + 1), 0)

watch(history, (entries) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // storage full or disabled — history just won't survive a reload
  }
})

function evaluateExpression(expr: string): { result: number | null; error: string | null } {
  try {
    return { result: evaluate(expr), error: null }
  } catch (e) {
    return { result: null, error: e instanceof Error ? e.message : 'Invalid expression' }
  }
}

// only (re)computed on explicit submit (Enter / the Calculate button), not on every
// keystroke — validating partially-typed expressions as invalid reads as premature
// and flickers the error message and layout on each character
const evaluation = ref(evaluateExpression(expression.value))

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
// auto-dismiss the duplicate hint so it doesn't linger indefinitely
const DUPLICATE_HINT_MS = 4000
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

function resizeExprInput() {
  const el = exprInput.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(expression, () => {
  setDuplicateSubmit(false)
  nextTick(resizeExprInput)
})
onMounted(resizeExprInput)

// true while the box holds an example the user clicked but hasn't run or edited —
// keeps a bare click-/tab-away (blur) from committing it to history on its own
let exprFromExample = false

function submitExpression() {
  evaluation.value = evaluateExpression(expression.value)
  const { result, error } = evaluation.value
  if (error || result === null) return
  if (history.value[0]?.expression === expression.value) {
    setDuplicateSubmit(true)
    return
  }
  setDuplicateSubmit(false)
  exprFromExample = false
  const entry: HistoryEntry = { id: nextHistoryId++, expression: expression.value, result }
  history.value = [entry, ...history.value].slice(0, HISTORY_LIMIT)
}

// blur commits by default (type an expression, click away, see it saved) — but not
// for an untouched example the user merely clicked; that enters history only via an
// explicit Enter / Calculate, or once they've hand-edited it (see onExprInput)
function handleBlur() {
  if (exprFromExample) return
  submitExpression()
}

// a hand-typed edit makes the box the user's own again, so a later blur may commit it
function onExprInput() {
  exprFromExample = false
}

function recallHistory(entry: HistoryEntry) {
  expression.value = entry.expression
  // the entry's result is already known — show it without requiring a resubmit
  evaluation.value = { result: entry.result, error: null }
  setDuplicateSubmit(false)
  nextTick(resizeExprInput)
}

// load an example into the input and evaluate it inline, WITHOUT committing to
// history — so a reviewer can click through every example (comparing each result
// against its `expected`) while the panel stays put. Only an explicit submit
// (Enter / Calculate / blur) commits and swaps this panel out for history.
function runExample(expr: string) {
  expression.value = expr
  evaluation.value = evaluateExpression(expr)
  exprFromExample = true
  setDuplicateSubmit(false)
  nextTick(() => {
    resizeExprInput()
    exprInput.value?.focus()
  })
}

const confirmingClear = ref(false)

function requestClearHistory() {
  confirmingClear.value = true
}

function cancelClearHistory() {
  confirmingClear.value = false
}

function clearHistory() {
  history.value = []
  confirmingClear.value = false
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') showDocs.value = false
}

watch(showDocs, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    window.addEventListener('keydown', closeOnEscape)
  } else {
    window.removeEventListener('keydown', closeOnEscape)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', closeOnEscape)
  document.body.style.overflow = ''
  clearTimeout(duplicateHintTimer)
})
</script>

<template>
  <section id="center" :class="{ 'has-history': history.length > 0 }">
    <div class="hero">
      <p class="eyebrow">
        <span lang="ja">七夕</span> <span class="eyebrow-sub">Tanabata · 7.7</span>
      </p>
      <div class="hero-star">
        <img
          :src="ohoshisama"
          class="star"
          width="150"
          height="150"
          alt="Ohoshisama, the Stor mascot"
        />
      </div>
      <h1 class="wordmark">Stor</h1>
      <p class="tagline">an <b>S</b>-expression calcula<b>tor</b></p>
      <div class="expr-wrap">
        <p class="expr">
          <textarea
            ref="exprInput"
            v-model="expression"
            class="expr-input"
            rows="1"
            aria-label="S-expression input"
            placeholder="(+ 1 2)"
            spellcheck="false"
            @input="onExprInput"
            @keydown.enter.prevent="submitExpression"
            @blur="handleBlur"
          ></textarea>
          <span class="expr-output">
            <span class="eq">=</span>
            <span v-if="!evaluation.error" class="result" aria-live="polite">{{
              displayResult
            }}</span>
            <button
              type="button"
              class="submit-btn"
              :disabled="!canSubmit"
              title="Calculate"
              aria-label="Calculate"
              @mousedown.prevent
              @click="submitExpression"
            >
              Calculate
            </button>
          </span>
        </p>
        <p class="expr-note" :class="{ error: hasError }" aria-live="polite">
          <template v-if="hasError"><strong>Error:</strong> {{ evaluation.error }}</template>
          <template v-else-if="isDuplicateSubmit">
            Already saved — this matches the last history entry
          </template>
        </p>
      </div>
      <div v-if="!history.length" class="examples-panel">
        <h2>Examples <span class="examples-hint">tap to run</span></h2>
        <ul class="examples-list" aria-label="Example expressions">
          <li v-for="ex in EXAMPLES" :key="ex.expr">
            <button
              type="button"
              class="example-item"
              @mousedown.prevent
              @click="runExample(ex.expr)"
            >
              <code class="example-expr">{{ ex.expr }}</code>
              <span class="example-expected">= {{ ex.expected }}</span>
            </button>
          </li>
        </ul>
      </div>
      <div v-if="history.length" class="history-panel">
        <h2>
          History <span class="history-count">last {{ HISTORY_LIMIT }}</span>
        </h2>
        <ul class="history" aria-label="Expression history">
          <li v-for="entry in history" :key="entry.id">
            <button type="button" class="history-item" @click="recallHistory(entry)">
              <code class="history-expr">{{ entry.expression }}</code>
              <span class="history-result">{{ formatResult(entry.result) }}</span>
            </button>
          </li>
        </ul>
        <div class="history-foot">
          <p v-if="confirmingClear" class="history-confirm">
            Clear history?
            <button type="button" class="history-confirm-yes" @click="clearHistory">Yes</button>
            <button type="button" class="history-confirm-no" @click="cancelClearHistory">
              Cancel
            </button>
          </p>
          <button
            v-else
            type="button"
            class="history-clear"
            title="Clear history"
            aria-label="Clear history"
            @click="requestClearHistory"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.35"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M4.5 6h11M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2 0-.5 9.5A1.5 1.5 0 0 1 12 17H8a1.5 1.5 0 0 1-1.5-1.5L6 6"
              />
              <path d="M8.25 9v4.5M11.75 9v4.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section id="next-steps">
    <div id="docs">
      <h2>Docs <span class="jp" lang="ja">案内</span></h2>
      <ul>
        <li class="tanzaku-holder">
          <button
            type="button"
            class="link-button"
            :class="{ open: showDocs }"
            :aria-expanded="showDocs"
            aria-controls="docs-tanzaku"
            @click="showDocs = !showDocs"
          >
            <img class="logo" :src="ohoshisama" alt="" />
            How it works
          </button>

          <Teleport to="body">
            <Transition name="modal">
              <div v-if="showDocs" class="modal-backdrop" @click.self="showDocs = false">
                <div
                  id="docs-tanzaku"
                  class="tanzaku"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="docs-modal-title"
                >
                  <button
                    type="button"
                    class="modal-close"
                    aria-label="Close"
                    @click="showDocs = false"
                  >
                    &times;
                  </button>
                  <h2 id="docs-modal-title">What is Stor?</h2>
                  <p>
                    Stor is a calculator for s-expressions. Instead of typing
                    <code class="nowrap">1 + 2</code>, you write expressions in prefix notation,
                    with the operator first:
                  </p>
                  <p><code>(+ 1 2)</code></p>
                  <p>Supported operators:</p>
                  <ul class="docs-list">
                    <li><code>+</code> addition</li>
                    <li><code>-</code> subtraction</li>
                    <li><code>*</code> multiplication</li>
                    <li><code>/</code> division</li>
                    <li><code>^</code> exponentiation</li>
                    <li><code>%</code> modulo</li>
                  </ul>
                  <p>Expressions can be nested, for example:</p>
                  <p><code>(* (+ (^ 3 4) (% 11 3)) (/ (- 15 5) 2))</code></p>
                  <small>
                    Operands must be plain decimal numbers — scientific notation
                    (<code>2e3</code>) is accepted, but hexadecimal (<code>0x</code>), binary
                    (<code>0b</code>), and octal (<code>0o</code>) literals are not.
                  </small>
                </div>
              </div>
            </Transition>
          </Teleport>
        </li>
      </ul>
    </div>
    <div id="social">
      <h2>Source Code <span class="jp" lang="ja">短冊</span></h2>
      <ul>
        <li class="tanzaku-holder">
          <a
            href="https://github.com/chairulakmal/ohoshisama"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#github-icon"></use>
            </svg>
            GitHub
            <span class="negai" aria-hidden="true">
              <span lang="ja">みんなが健康でありますように</span>
              <span class="negai-en">may everyone be healthy</span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </section>

  <footer id="footer">
    <p class="footer-credit">
      <img :src="vueLogo" class="vue-badge" alt="Vue logo" />
      written in Vue 3 on <span lang="ja">七月七日</span>
    </p>
  </footer>
</template>
