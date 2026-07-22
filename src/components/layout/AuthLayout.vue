<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/30 px-4">
    <div class="w-full max-w-sm">
      <RouterLink to="/" class="mb-8 flex justify-center text-lg font-semibold tracking-tight">
        Sicakra
      </RouterLink>
      <slot />
    </div>
  </div>
</template>
