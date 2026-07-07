<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import ohoshisama from '../assets/ohoshisama.svg'
import vueLogo from '../assets/vue.svg'
import { evaluate } from '../lib/evaluator'

const showDocs = ref(false)
const expression = ref('(+ 1 (* 2 3))')
const exprInput = ref<HTMLTextAreaElement | null>(null)
const history = ref<{ expression: string; result: number }[]>([])

const evaluation = computed(() => {
  try {
    return { result: evaluate(expression.value), error: null }
  } catch (e) {
    return { result: null, error: e instanceof Error ? e.message : 'Invalid expression' }
  }
})

// show a prompt when the field is empty
const isEmpty = computed(() => expression.value.trim() === '')
const hasError = computed(() => evaluation.value.error !== null && !isEmpty.value)

function resizeExprInput() {
  const el = exprInput.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(expression, () => nextTick(resizeExprInput))
onMounted(resizeExprInput)

const canSave = computed(() => {
  const { result, error } = evaluation.value
  if (error || result === null) return false
  return history.value[0]?.expression !== expression.value
})

function commitToHistory() {
  const { result, error } = evaluation.value
  if (error || result === null) return
  const entry = { expression: expression.value, result }
  if (history.value[0]?.expression === entry.expression) return
  history.value = [entry, ...history.value].slice(0, 8)
}

function recallHistory(entry: { expression: string; result: number }) {
  expression.value = entry.expression
  nextTick(resizeExprInput)
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
})
</script>

<template>
  <section id="center">
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
            @keydown.enter.prevent="commitToHistory"
          ></textarea>
          <span class="eq">=</span>
          <span v-if="!evaluation.error" class="result">{{ evaluation.result }}</span>
          <button
            type="button"
            class="save-btn"
            :disabled="!canSave"
            title="Save to history"
            aria-label="Save to history"
            @click="commitToHistory"
          >
            Save
          </button>
        </p>
        <p class="expr-note" :class="{ error: hasError }">
          <strong v-if="hasError">Error:</strong> {{ evaluation.error }}
        </p>
      </div>
      <div v-if="history.length" class="history-panel">
        <h2>History</h2>
        <ul class="history" aria-label="Expression history">
          <li v-for="(entry, i) in history" :key="i">
            <button type="button" class="history-item" @click="recallHistory(entry)">
              <code class="history-expr">{{ entry.expression }}</code>
              <span class="history-result">{{ entry.result }}</span>
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
            Explore Stor
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
                    <code>1 + 2</code>, you write expressions in prefix notation, with the operator
                    first:
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
                    Operands must be plain decimal numbers — hexadecimal (<code>0x</code>), binary
                    (<code>0b</code>), and octal (<code>0o</code>) literals are not accepted.
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
