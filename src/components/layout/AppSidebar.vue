<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { getMenuGroups } from '@/lib/menu'
import { cn } from '@/lib/utils'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const menuGroups = computed(() => getMenuGroups(authStore.tipePengguna, authStore.peranAdmin))

function isAktif(to: string) {
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    :class="
      cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-200',
        uiStore.sidebarCollapsed ? 'w-16' : 'w-64',
      )
    "
  >
    <!-- Logo -->
    <div class="flex h-14 items-center gap-2 border-b px-4">
      <div class="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        S
      </div>
      <span v-if="!uiStore.sidebarCollapsed" class="truncate font-semibold">Sicakra</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 space-y-4 overflow-y-auto p-3">
      <div v-for="(grup, i) in menuGroups" :key="i">
        <p
          v-if="grup.label && !uiStore.sidebarCollapsed"
          class="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          {{ grup.label }}
        </p>
        <RouterLink
          v-for="item in grup.items"
          :key="item.to"
          :to="item.to"
          :class="
            cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isAktif(item.to)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          "
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span v-if="!uiStore.sidebarCollapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- Toggle collapse -->
    <div class="border-t p-3">
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        @click="uiStore.toggleSidebar"
      >
        <component :is="uiStore.sidebarCollapsed ? PanelLeftOpen : PanelLeftClose" class="size-4 shrink-0" />
        <span v-if="!uiStore.sidebarCollapsed">Ciutkan</span>
      </button>
    </div>
  </aside>
</template>
