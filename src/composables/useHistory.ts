import { ref, watch } from 'vue'

export type HistoryEntry = { id: number; expression: string; result: number }

export const HISTORY_LIMIT = 8
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

// Owns the evaluation history: its persisted state, the dedupe check submit relies
// on, and the clear/confirm flow. The calculator drives it through addEntry / isTopEntry.
export function useHistory() {
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

  function isTopEntry(expression: string): boolean {
    return history.value[0]?.expression === expression
  }

  function addEntry(expression: string, result: number) {
    const entry: HistoryEntry = { id: nextHistoryId++, expression, result }
    history.value = [entry, ...history.value].slice(0, HISTORY_LIMIT)
  }

  const confirmingClear = ref(false)

  function requestClear() {
    confirmingClear.value = true
  }

  function cancelClear() {
    confirmingClear.value = false
  }

  function clear() {
    history.value = []
    confirmingClear.value = false
  }

  return { history, isTopEntry, addEntry, confirmingClear, requestClear, cancelClear, clear }
}
