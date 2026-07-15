<script setup lang="ts">
import { formatResult } from '../lib/format'
import type { HistoryEntry } from '../composables/useHistory'

defineProps<{
  history: HistoryEntry[]
  limit: number
  confirmingClear: boolean
}>()

const emit = defineEmits<{
  recall: [entry: HistoryEntry]
  'request-clear': []
  'confirm-clear': []
  'cancel-clear': []
}>()
</script>

<template>
  <div class="history-panel">
    <h2>
      History <span class="history-count">last {{ limit }}</span>
    </h2>
    <ul class="history" aria-label="Expression history">
      <li v-for="entry in history" :key="entry.id">
        <button type="button" class="history-item" @click="emit('recall', entry)">
          <code class="history-expr">{{ entry.expression }}</code>
          <span class="history-result">{{ formatResult(entry.result) }}</span>
        </button>
      </li>
    </ul>
    <div class="history-foot">
      <p v-if="confirmingClear" class="history-confirm">
        Clear history?
        <button type="button" class="history-confirm-yes" @click="emit('confirm-clear')">
          Yes
        </button>
        <button type="button" class="history-confirm-no" @click="emit('cancel-clear')">
          Cancel
        </button>
      </p>
      <button
        v-else
        type="button"
        class="history-clear"
        title="Clear history"
        aria-label="Clear history"
        @click="emit('request-clear')"
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
</template>
