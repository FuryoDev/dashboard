export default {
  beforeMount(el, binding) {
    if (typeof binding.value !== 'function') {
      const warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
      console.warn(warn)
    }

    const { bubble } = binding.modifiers
    const handler = (e) => {
      if (bubble || (!el.contains(e.target) && el !== e.target)) {
        binding.value(e)
      }
    }

    el.vueClickOutside = handler
    document.addEventListener('click', handler)
  },
  unmounted(el) {
    document.removeEventListener('click', el.vueClickOutside)
    el.vueClickOutside = null
  },
}
