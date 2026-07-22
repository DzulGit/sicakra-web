import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

/**
 * Preferensi UI yang perlu bertahan lintas sesi (bukan data server).
 */
export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = useLocalStorage<boolean>('sicakra_sidebar_collapsed', false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, toggleSidebar }
})
