<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const today = computed(() => dateFormatter.format(new Date()))
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ greeting }}, {{ authStore.pengguna?.nama_lengkap ?? 'Admin' }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ today }}</p>
    </div>
  </div>
</template>
