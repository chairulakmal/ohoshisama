<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import ohoshisama from '../assets/ohoshisama.svg'
import vueLogo from '../assets/vue.svg'

const showDocs = ref(false)

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
      <p class="expr" aria-label="Example: plus one times two three equals seven">
        <span class="paren">(</span>+&nbsp;1&nbsp;<span class="paren">(</span>*&nbsp;2&nbsp;3<span
          class="paren"
          >)</span
        ><span class="paren">)</span>
        <span class="eq">=</span>
        <span class="result">7</span>
      </p>
      <p class="expr-note">seven — for the seventh night of the seventh month</p>
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
                    <code>1 + 2</code>, you write expressions in prefix notation, with the
                    operator first:
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
                  <p>
                    Operands must be plain decimal numbers — hexadecimal (<code>0x</code>), binary
                    (<code>0b</code>), and octal (<code>0o</code>) literals are not accepted.
                  </p>
                  <p>Expressions can be nested to any depth, for example:</p>
                  <p><code>(* (+ (^ 3 4) (% 11 3)) (/ (- 15 5) 2))</code></p>
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
