<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, MessageCircle } from 'lucide-vue-next'
import { usePaketInternetList } from '@/modules/paket-internet/composables/usePaketInternet'
import type { PaketInternet } from '@/types/models'

const { data: daftarPaket, isLoading } = usePaketInternetList()

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai),
  )
}

// Bukan kategori formal di database — cuma label bantu presentasi berdasarkan
// kecepatan, supaya pengunjung lebih gampang relate ("oh ini buat rumah gue").
function labelCocokUntuk(paket: PaketInternet) {
  return paket.kecepatan_mbps <= 30 ? 'Cocok untuk Rumahan' : 'Cocok untuk Rumahan & Bisnis'
}

const adaPaket = computed(() => (daftarPaket.value?.length ?? 0) > 0)
</script>

<template>
  <div>
    <!-- ============ HEADER ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">Paket Internet</p>
        <h1 class="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Harga jelas, tanpa kejutan.</h1>
        <p class="mt-4 max-w-lg text-landing-mist/70">
          Semua paket sudah termasuk pemasangan dan perangkat. Kalau kebutuhan kamu tidak cocok di
          daftar ini, kami bisa hitungkan penawaran khusus.
        </p>
      </div>
    </section>

    <!-- ============ DAFTAR PAKET ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16">
        <div v-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 3" :key="n" class="h-64 animate-pulse rounded-2xl bg-landing-paper" />
        </div>

        <div v-else-if="!adaPaket" class="rounded-2xl bg-landing-paper p-12 text-center text-landing-ink/60">
          Belum ada paket reguler yang tersedia saat ini. Coba hubungi kami langsung untuk penawaran.
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="paket in daftarPaket" :key="paket.id" class="flex flex-col rounded-2xl bg-landing-paper p-6">
            <p class="font-landing-mono text-xs uppercase tracking-wider text-landing-teal">
              {{ labelCocokUntuk(paket) }}
            </p>
            <h3 class="mt-2 font-display text-2xl text-landing-ink">{{ paket.nama_paket }}</h3>
            <p class="mt-1 font-landing-mono text-3xl text-landing-ink">
              {{ paket.kecepatan_mbps }}
              <span class="text-base font-normal text-landing-ink/50">Mbps</span>
            </p>
            <p class="mt-4 flex-1 text-sm text-landing-ink/60">{{ paket.deskripsi }}</p>
            <p class="mt-6 font-landing-mono text-lg text-landing-ink">
              {{ formatRupiah(paket.harga) }}
              <span class="text-xs font-normal text-landing-ink/50">/ bulan</span>
            </p>
            <RouterLink
              :to="`/daftar?paket_internet_id=${paket.id}`"
              class="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-landing-ink px-5 py-2.5 text-sm font-medium text-landing-mist transition-colors hover:bg-landing-teal-deep"
            >
              Pilih Paket Ini
              <ArrowRight class="size-4" />
            </RouterLink>
          </div>

          <!-- Custom — konsisten dgn treatment di Home -->
          <div class="flex flex-col justify-between rounded-2xl bg-landing-ink p-6 text-landing-mist">
            <div>
              <span class="inline-flex size-10 items-center justify-center rounded-full bg-landing-signal/15">
                <MessageCircle class="size-5 text-landing-signal" />
              </span>
              <p class="mt-4 font-landing-mono text-xs uppercase tracking-wider text-landing-signal">
                Kebutuhan Khusus?
              </p>
              <h3 class="mt-2 font-display text-2xl">Custom</h3>
              <p class="mt-2 text-sm text-landing-mist/60">
                Butuh kecepatan lebih tinggi, IP statis, atau instalasi khusus di luar daftar ini?
                Ceritakan kebutuhan kamu.
              </p>
            </div>
            <RouterLink
              to="/daftar"
              class="mt-6 inline-flex items-center gap-1 text-sm font-medium text-landing-signal"
            >
              Konsultasi Gratis
              <ArrowRight class="size-4" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
