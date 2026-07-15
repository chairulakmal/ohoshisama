<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  result: string
  error: string | null
  hasError: boolean
  canSubmit: boolean
  isDuplicateSubmit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  blur: []
  input: []
}>()

const exprInput = ref<HTMLTextAreaElement | null>(null)

// grow the textarea to fit its content so the result never reflows against a scrollbar
function resize() {
  const el = exprInput.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  emit('input')
}

// resize on every value change, whether typed here or set from a recall / example
watch(
  () => props.modelValue,
  () => nextTick(resize)
)
onMounted(resize)

defineExpose({ focus: () => exprInput.value?.focus() })
</script>

<template>
  <div class="expr-wrap">
    <p class="expr">
      <textarea
        ref="exprInput"
        :value="modelValue"
        class="expr-input"
        rows="1"
        aria-label="S-expression input"
        placeholder="(+ 1 2)"
        spellcheck="false"
        @input="onInput"
        @keydown.enter.prevent="emit('submit')"
        @blur="emit('blur')"
      ></textarea>
      <span class="expr-output">
        <span class="eq">=</span>
        <span v-if="!error" class="result" aria-live="polite">{{ result }}</span>
        <button
          type="button"
          class="submit-btn"
          :disabled="!canSubmit"
          title="Calculate"
          aria-label="Calculate"
          @mousedown.prevent
          @click="emit('submit')"
        >
          Calculate
        </button>
      </span>
    </p>
    <p class="expr-note" :class="{ error: hasError }" aria-live="polite">
      <template v-if="hasError"><strong>Error:</strong> {{ error }}</template>
      <template v-else-if="isDuplicateSubmit">
        Already saved — this matches the last history entry
      </template>
    </p>
  </div>
</template>
