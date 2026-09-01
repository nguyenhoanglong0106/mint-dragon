import { computed, onMounted, ref, watch } from 'vue'

type ThemeMode = 'light' | 'dark' | 'system'
const mode = ref<ThemeMode>((localStorage.getItem('theme-mode') as ThemeMode) || 'system')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

export function useTheme() {
  const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && prefersDark.matches))
  const apply = () => document.documentElement.classList.toggle('dark', isDark.value)
  const setTheme = (value: ThemeMode) => { mode.value = value; localStorage.setItem('theme-mode', value); apply() }
  onMounted(apply)
  watch(mode, apply)
  return { mode, isDark, setTheme }
}
