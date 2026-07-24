<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { loginPelangganSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'
import { useLoginPelanggan } from '../composables/usePelangganAuth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

// Catatan: form "login pertama kali tanpa password" (nomor pelanggan + nomor HP)
// sengaja tidak dipakai lagi. Password default pelanggan baru = nomor pelanggan
// mereka sendiri (di-set backend saat pemasangan selesai). Ganti password
// ditawarkan opsional lewat popup di dashboard, tidak dipaksa di sini atau
// lewat route guard.

const form = useForm({
  validationSchema: toTypedSchema(loginPelangganSchema),
})
const [nomorPelanggan, nomorPelangganAttrs] = form.defineField('nomor_pelanggan')
const [password, passwordAttrs] = form.defineField('password')
const { mutate: login, isPending } = useLoginPelanggan()

const showPassword = ref(false)

const submitLogin = form.handleSubmit((values) => {
  login(values, {
    onSuccess: ({ data }) => {
      const { pelanggan, token } = data.data
      authStore.setSesi(token, {
        id: pelanggan.id,
        nama_lengkap: pelanggan.nama_lengkap,
        tipe: 'pelanggan',
        // TODO: pastikan field ini benar-benar dikirim backend pada response login.
        password_sudah_dibuat: pelanggan.password_sudah_dibuat ?? true,
      })
      toast.success(`Selamat datang, ${pelanggan.nama_lengkap}`)
      router.push('/pelanggan/dashboard')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) form.setErrors(fieldErrors)
      else toast.error('Nomor pelanggan atau password salah.')
    },
  })
})
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- ============ SISI KIRI — Brand & pesan ============ -->
    <div
      class="relative hidden overflow-hidden bg-landing-ink px-12 py-16 text-landing-mist lg:flex lg:flex-col lg:justify-center">
      <div class="absolute -right-24 -top-24 size-96 rounded-full border border-landing-signal/10" />
      <div class="absolute -bottom-32 -left-16 size-80 rounded-full border border-landing-signal/10" />

      <RouterLink to="/" class="absolute left-12 top-14 z-20 flex flex-col transition-all duration-300">
        <span class="font-display text-3xl font-semibold tracking-tight text-white hover:text-landing-signal">
          Sicakra
        </span>

        <span class="mt-1 text-[11px] uppercase tracking-[0.22em] text-landing-mist/60">
          by PT Aqrapana Daya Mandiri
        </span>
      </RouterLink>

      <div class="absolute left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-landing-signal/5 blur-3xl" />

      <div class="relative z-10">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">
          Portal Pelanggan
        </p>
        <h1 class="mt-6 max-w-md font-display text-4xl leading-[1.1] tracking-tight">
          Koneksi yang <em class="italic text-landing-signal">selalu menyala</em> dimulai dari sini.
        </h1>
        <p class="mt-6 max-w-sm text-sm text-landing-mist/60">
          Masuk untuk memantau layanan, tagihan, dan melaporkan kendala jaringan kamu — semua
          dalam satu tempat.
        </p>
        <div class="mt-10 flex items-center gap-4">
          <div class="h-px w-14 bg-landing-signal/70"></div>
          <span class="font-landing-mono text-[11px] uppercase tracking-[0.25em] text-landing-mist/40">
            Fast • Stable • Reliable
          </span>
        </div>
      </div>

      <!-- Logo Footer -->
      <div class="absolute bottom-10 left-7 z-10 flex items-center gap-3">
        <img src="/sicakra.png" alt="Logo Sicakra" 
          class="h-20 w-auto object-contain transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(255,196,0,0.45)]" />

        <img src="/aqrapana.png" alt="Logo Aqrapana"
          class="h-20 w-auto object-contain transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(255,196,0,0.45)]" />
      </div>

      <div class="absolute right-20 top-1/2 -translate-y-1/2 opacity-10">
        <div class="grid grid-cols-5 gap-4">
          <span v-for="i in 25" :key="i" class="h-1.5 w-1.5 rounded-full bg-landing-signal" />
        </div>
      </div>
    </div>

    <!-- ============ SISI KANAN — Form login ============ -->
    <div
      class="relative overflow-hidden flex min-h-screen items-center justify-center bg-landing-mist px-6 py-12 sm:py-16 lg:min-h-0">
      <!-- Decorative circles -->
      <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full border-2 border-landing-ink/25 z-0" />
      <div class="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-2 border-landing-ink/25 z-0" />

      <div class="absolute z-10 w-full max-w-sm">

        <div class="text-center lg:mt-0 lg:text-left">
          <h2 class="font-display text-2xl tracking-tight text-landing-ink sm:text-[26px]">
            Selamat Datang Kembali
          </h2>
          <p class="mt-1.5 text-sm text-landing-ink/55">Silakan masuk ke akun pelanggan Anda</p>
        </div>

        <form class="mt-8 space-y-5" novalidate @submit="submitLogin">
          <div class="space-y-2">
            <Label for="nomor_pelanggan" class="text-landing-ink/80">Nomor Pelanggan</Label>
            <Input id="nomor_pelanggan" v-model="nomorPelanggan" v-bind="nomorPelangganAttrs" placeholder="PLG000001"
              autocomplete="username" class="h-11 border-landing-ink/15 bg-white focus-visible:ring-landing-signal"
              :aria-invalid="!!form.errors.value.nomor_pelanggan" />
            <p v-if="form.errors.value.nomor_pelanggan" class="text-xs text-destructive">
              {{ form.errors.value.nomor_pelanggan }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-landing-ink/80">Password</Label>
            <div class="relative">
              <Input id="password" v-model="password" v-bind="passwordAttrs" :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••" autocomplete="current-password"
                class="h-11 border-landing-ink/15 bg-white pr-10 focus-visible:ring-landing-signal"
                :aria-invalid="!!form.errors.value.password" />
              <button type="button"
                class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-landing-ink/40 hover:text-landing-ink"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="form.errors.value.password" class="text-xs text-destructive">
              {{ form.errors.value.password }}
            </p>
            <p class="text-xs text-landing-ink/45">
              Belum pernah ganti password? Gunakan nomor pelanggan kamu sebagai password.
            </p>
          </div>

          <Button type="submit"
            class="h-11 w-full rounded-full bg-landing-ink text-sm font-medium text-landing-mist hover:bg-landing-ink/90"
            :disabled="isPending">
            {{ isPending ? 'Memproses...' : 'Masuk' }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>