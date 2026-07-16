<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const faq = [
  {
    tanya: 'Berapa lama proses dari daftar sampai internet menyala?',
    jawab:
      'Rata-rata 3-5 hari kerja: verifikasi data (maks. 1x24 jam), lalu survey & pemasangan dijadwalkan sesuai ketersediaan teknisi di area kamu.',
  },
  {
    tanya: 'Apakah ada biaya pemasangan terpisah?',
    jawab: 'Tidak. Biaya pemasangan dan perangkat (ONT/router) sudah termasuk dalam paket bulanan yang kamu pilih.',
  },
  {
    tanya: 'Wilayah mana saja yang sudah terjangkau Sicakra?',
    jawab:
      'Saat ini kami melayani 12 kecamatan. Kalau ragu apakah lokasi kamu terjangkau, tetap isi formulir pendaftaran — tim kami akan konfirmasi saat verifikasi.',
  },
  {
    tanya: 'Bagaimana kalau internet saya bermasalah?',
    jawab:
      'Login ke dashboard pelanggan dan buat Laporan Kendala, atau hubungi kami langsung. Laporan diteruskan ke teknisi yang menangani area kamu.',
  },
  {
    tanya: 'Bisa pindah alamat tanpa pasang baru dari nol?',
    jawab:
      'Bisa — ini disebut relokasi. Ajukan lewat dashboard pelanggan, tim kami akan survey lokasi baru dan pasang ulang di sana, riwayat langganan kamu tetap sama.',
  },
  {
    tanya: 'Apa itu paket Custom?',
    jawab:
      'Untuk kebutuhan di luar paket standar — misalnya kecepatan lebih tinggi atau kebutuhan bisnis spesifik. Ajukan lewat form pendaftaran atau hubungi kami, tim akan menghitungkan penawaran khusus.',
  },
]
</script>

<template>
  <div>
    <!-- ============ HEADER ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">FAQ</p>
        <h1 class="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Pertanyaan yang sering ditanyakan.</h1>
      </div>
    </section>

    <!-- ============ DAFTAR FAQ ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto max-w-3xl px-6 py-16">
        <details
          v-for="item in faq"
          :key="item.tanya"
          class="group border-b border-landing-ink/10 py-5"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-landing-ink">
            <span class="font-display text-lg">{{ item.tanya }}</span>
            <Plus class="size-5 shrink-0 text-landing-teal transition-transform group-open:rotate-45" />
          </summary>
          <p class="mt-3 text-sm leading-relaxed text-landing-ink/60">{{ item.jawab }}</p>
        </details>

        <p class="mt-10 text-center text-sm text-landing-ink/60">
          Masih ada pertanyaan lain?
          <RouterLink to="/kontak" class="font-medium text-landing-teal hover:underline">
            Hubungi kami langsung
          </RouterLink>
        </p>
      </div>
    </section>
  </div>
</template>
