<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  resellerId: string | number
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2 border-b pb-3">
    <RouterLink
      :to="{ name: 'admin.operasional.reseller.pelanggan', params: { id: resellerId } }"
      class="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      active-class="border-primary bg-primary text-primary-foreground hover:bg-primary"
    >
      Pelanggan
    </RouterLink>

    <RouterLink
      :to="{ name: 'admin.operasional.reseller.paket', params: { id: resellerId } }"
      class="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      active-class="border-primary bg-primary text-primary-foreground hover:bg-primary"
    >
      Paket Internet
    </RouterLink>

    <RouterLink
      :to="{ name: 'admin.operasional.reseller.tagihan', params: { id: resellerId } }"
      class="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      active-class="border-primary bg-primary text-primary-foreground hover:bg-primary"
    >
      Tagihan
    </RouterLink>
  </div>
</template>
