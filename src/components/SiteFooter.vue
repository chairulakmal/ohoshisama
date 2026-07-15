<script setup lang="ts">
import vueLogo from '../assets/vue.svg'
</script>

<template>
  <footer id="footer">
    <p class="footer-credit">
      <img :src="vueLogo" class="vue-badge" alt="Vue logo" />
      written in Vue 3 on <span lang="ja">七月七日</span>
    </p>
  </footer>
</template>
