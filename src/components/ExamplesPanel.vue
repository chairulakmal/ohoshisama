<script setup lang="ts">
defineProps<{ examples: { expr: string }[] }>()
const emit = defineEmits<{ run: [expr: string] }>()
</script>

<template>
  <div class="examples-panel">
    <h2>Examples <span class="examples-hint">tap to run</span></h2>
    <ul class="examples-list" aria-label="Example expressions">
      <li v-for="ex in examples" :key="ex.expr">
        <button type="button" class="example-item" @mousedown.prevent @click="emit('run', ex.expr)">
          <code class="example-expr">{{ ex.expr }}</code>
        </button>
      </li>
    </ul>
  </div>
</template>
