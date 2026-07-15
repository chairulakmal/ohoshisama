<script setup lang="ts">
import { nextTick, ref } from 'vue'
import ohoshisama from '../assets/ohoshisama.svg'
import CalculatorInput from './CalculatorInput.vue'
import ExamplesPanel from './ExamplesPanel.vue'
import HistoryPanel from './HistoryPanel.vue'
import DocsSection from './DocsSection.vue'
import SiteFooter from './SiteFooter.vue'
import { useHistory, HISTORY_LIMIT } from '../composables/useHistory'
import { useCalculator } from '../composables/useCalculator'
import { useDocsModal } from '../composables/useDocsModal'

// the spec's worked examples, shown when history is empty as one-click runnable
// expressions — running one evaluates it inline without committing to history
const EXAMPLES: { expr: string }[] = [
  { expr: '(+ 1 2)' },
  { expr: '(- 5 3.5)' },
  { expr: '(/ (- 10 2) 4)' },
  { expr: '(* (+ 1 2) 3)' },
  { expr: '(+ (- 5 2) (* 3 7))' },
  { expr: '(* (+ (^ 3 4) (% 11 3)) (/ (- 15 5) 2))' }
]

const { history, isTopEntry, addEntry, confirmingClear, requestClear, cancelClear, clear } =
  useHistory()

const {
  expression,
  evaluation,
  displayResult,
  hasError,
  canSubmit,
  isDuplicateSubmit,
  submit,
  handleBlur,
  onInput,
  recall,
  runExample
} = useCalculator({ isTopEntry, addEntry })

const { showDocs } = useDocsModal()

const input = ref<InstanceType<typeof CalculatorInput> | null>(null)

// loading an example refocuses the input so the user can edit or submit it right away;
// wait a tick for CalculatorInput to render the new value before moving focus
function onRunExample(expr: string) {
  runExample(expr)
  nextTick(() => input.value?.focus())
}
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

      <CalculatorInput
        ref="input"
        v-model="expression"
        :result="displayResult"
        :error="evaluation.error"
        :has-error="hasError"
        :can-submit="canSubmit"
        :is-duplicate-submit="isDuplicateSubmit"
        @submit="submit"
        @blur="handleBlur"
        @input="onInput"
      />

      <ExamplesPanel v-if="!history.length" :examples="EXAMPLES" @run="onRunExample" />

      <HistoryPanel
        v-else
        :history="history"
        :limit="HISTORY_LIMIT"
        :confirming-clear="confirmingClear"
        @recall="recall"
        @request-clear="requestClear"
        @confirm-clear="clear"
        @cancel-clear="cancelClear"
      />
    </div>
  </section>

  <section id="next-steps">
    <DocsSection v-model:open="showDocs" />
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

  <SiteFooter />
</template>
