<script setup lang="ts">
import { Wrench, MapPin, Clock3 } from 'lucide-vue-next'
import StatusStrip from '@/components/landing/StatusStrip.vue'
import tentangKantor from '@/assets/landing/tentang-kantor.png'
import tentangKami from '@/assets/landing/tentang-kami.png'

const nilai = [
  {
    icon: Wrench,
    judul: 'Kami yang Pasang, Kami yang Perbaiki',
    deskripsi:
      'Tidak ada subkontraktor. Teknisi yang datang ke rumah kamu adalah karyawan kami sendiri — yang sama, yang datang lagi kalau ada masalah.',
  },
  {
    icon: MapPin,
    judul: 'Tim Lokal, Bukan Call Center Jauh',
    deskripsi:
      'Kantor dan gudang perangkat kami ada di wilayah yang kami layani. Kalau butuh datang langsung, kamu bisa.',
  },
  {
    icon: Clock3,
    judul: 'Respon Cepat, Bukan Janji Kosong',
    deskripsi:
      'Rata-rata waktu tanggap teknisi di bawah 24 jam — angka ini kami pantau tiap bulan, bukan cuma slogan.',
  },
]
</script>

<template>
  <div>
    <!-- ============ HEADER ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">Tentang Kami</p>
        <h1 class="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
          ISP daerah yang dibangun oleh orang yang tinggal di sini juga.
        </h1>
      </div>
    </section>

    <!-- ============ CERITA ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div class="relative order-2 lg:order-1">
          <img :src="tentangKantor" alt="Kantor Sicakra" class="aspect-[4/3] w-full rounded-2xl object-cover" />
          <img
            :src="tentangKami"
            alt="Tim Sicakra"
            class="absolute -bottom-8 -right-6 hidden aspect-[4/5] w-40 rounded-xl border-4 border-landing-mist object-cover shadow-lg sm:block lg:w-48"
          />
        </div>

        <div class="order-1 lg:order-2">
          <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-teal">Cerita Kami</p>
          <h2 class="mt-3 font-display text-3xl tracking-tight text-landing-ink sm:text-4xl">
            Dimulai dari keluhan yang sama berulang-ulang.
          </h2>
          <p class="mt-5 text-sm leading-relaxed text-landing-ink/70">
            Sicakra berdiri karena kami capek dengar cerita yang sama: internet mati, telepon call
            center antre berjam-jam, dan yang datang benerin entah siapa. PT Aqrapana Jaya Mandiri
            memutuskan membangun jaringan sendiri di daerah ini — dengan tim yang benar-benar tinggal
            dan bisa dihubungi di sini.
          </p>
          <p class="mt-4 text-sm leading-relaxed text-landing-ink/70">
            Sampai hari ini prinsipnya masih sama: kalau ada yang rusak, yang datang bukan orang asing.
          </p>
        </div>
      </div>
    </section>

    <StatusStrip
      :items="['Berdiri Sejak 2019', 'Melayani 12 Kecamatan', '3.200+ Pelanggan Aktif']"
    />

    <!-- ============ NILAI ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="max-w-xl">
          <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-teal">Prinsip Kami</p>
          <h2 class="mt-3 font-display text-3xl tracking-tight text-landing-ink sm:text-4xl">
            Tiga hal yang tidak kami kompromikan.
          </h2>
        </div>

        <div class="mt-12 grid gap-8 sm:grid-cols-3">
          <div v-for="item in nilai" :key="item.judul">
            <span class="inline-flex size-11 items-center justify-center rounded-full bg-landing-teal/10">
              <component :is="item.icon" class="size-5 text-landing-teal" />
            </span>
            <h3 class="mt-4 font-display text-lg text-landing-ink">{{ item.judul }}</h3>
            <p class="mt-2 text-sm text-landing-ink/60">{{ item.deskripsi }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 class="font-display text-3xl tracking-tight sm:text-4xl">Ingin jadi bagian dari 3.200+ pelanggan kami?</h2>
        <RouterLink
          to="/daftar"
          class="mt-8 inline-flex items-center gap-2 rounded-full bg-landing-signal px-8 py-3.5 text-sm font-medium text-landing-ink"
        >
          Daftar Berlangganan
        </RouterLink>
      </div>
    </section>
  </div>
</template>
