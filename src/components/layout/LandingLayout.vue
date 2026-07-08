<script setup lang="ts">
import LandingNavbar from './LandingNavbar.vue'
import LandingFooter from './LandingFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <LandingNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
