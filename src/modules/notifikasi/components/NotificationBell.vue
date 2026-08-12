<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useNotifikasiList } from '@/modules/notifikasi/composables/useNotifikasi'

const router = useRouter()
const authStore = useAuthStore()
const { data: response, isLoading } = useNotifikasiList()

const unreadCount = computed(() => response.value?.meta.unread_count ?? 0)

function bukaHalamanNotifikasi() {
  const base = authStore.tipePengguna === 'pelanggan' ? '/pelanggan' : '/admin'
  router.push(`${base}/notifikasi`)
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    aria-label="Buka halaman Notifikasi"
    class="relative"
    :disabled="isLoading"
    @click="bukaHalamanNotifikasi"
  >
    <Bell class="size-4" />
    <span
      v-if="unreadCount > 0"
      class="pointer-events-none absolute -right-1 -top-1 rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </Button>
</template>