<script setup lang="ts">
import ohoshisama from '../assets/ohoshisama.svg'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
  <div id="docs">
    <h2>Docs <span class="jp" lang="ja">案内</span></h2>
    <ul>
      <li class="tanzaku-holder">
        <button
          type="button"
          class="link-button"
          :class="{ open }"
          :aria-expanded="open"
          aria-controls="docs-tanzaku"
          @click="emit('update:open', !open)"
        >
          <img class="logo" :src="ohoshisama" alt="" />
          How it works
        </button>

        <Teleport to="body">
          <Transition name="modal">
            <div v-if="open" class="modal-backdrop" @click.self="emit('update:open', false)">
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
                  @click="emit('update:open', false)"
                >
                  &times;
                </button>
                <h2 id="docs-modal-title">What is Stor?</h2>
                <p>
                  Stor is a calculator for s-expressions. Instead of typing
                  <code class="nowrap">1 + 2</code>, you write expressions in prefix notation, with
                  the operator first:
                  <code class="nowrap">(+ 1 2)</code>
                </p>
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
                  Operands must be plain decimal numbers — scientific notation (<code>2e3</code>) is
                  accepted, but hexadecimal (<code>0x</code>), binary (<code>0b</code>), and octal
                  (<code>0o</code>) literals are not.
                </small>
              </div>
            </div>
          </Transition>
        </Teleport>
      </li>
    </ul>
  </div>
</template>
