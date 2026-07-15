import { onUnmounted, ref, watch } from 'vue'

// Owns the docs modal's open state and its global side effects: locking body scroll
// while open and closing on Escape, with listeners cleaned up on unmount.
export function useDocsModal() {
  const showDocs = ref(false)

  function toggle() {
    showDocs.value = !showDocs.value
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

  return { showDocs, toggle }
}
