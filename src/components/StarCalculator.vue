<script setup lang="ts">
import ohoshisama from '../assets/ohoshisama.svg'
import vueLogo from '../assets/vue.svg'
</script>

<template>
  <section id="center">
    <div class="hero">
      <img :src="ohoshisama" class="base" width="170" height="179" alt="" />
      <img :src="ohoshisama" class="vite" alt="Ohoshisama logo" />
    </div>
  </section>

  <div class="ticks"></div>

  <section id="next-steps">
    <div id="docs">
      <h2>Docs</h2>
      <ul>
        <li>
          <a href="https://vite.dev/" target="_blank">
            <img class="logo" :src="ohoshisama" alt="" />
            Explore Stor
          </a>
        </li>
      </ul>
    </div>
    <div id="social">
      <h2>Source Code</h2>
      <ul>
        <li>
          <a href="https://github.com/chairulakmal/ohoshisama" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#github-icon"></use>
            </svg>
            GitHub
          </a>
        </li>
      </ul>
    </div>
  </section>

  <div class="ticks"></div>
  <section id="spacer"></section>

  <footer id="footer">
    <img :src="vueLogo" class="vue-badge" alt="Vue logo" />
    <span>Written in Vue 3</span>
  </footer>
</template>
