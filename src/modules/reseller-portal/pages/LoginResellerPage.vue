<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useQueryClient } from '@tanstack/vue-query'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import { Eye, EyeOff, Store } from 'lucide-vue-next'
import { loginAdminSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'
import { useLoginReseller } from '../composables/useResellerPortal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const queryClient = useQueryClient()
const router = useRouter()

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(loginAdminSchema),
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const { mutate: login, isPending } = useLoginReseller()
const showPassword = ref(false)

const onSubmit = handleSubmit((values) => {
  login(values, {
    onSuccess: ({ data }) => {
      const { admin, token } = data.data

      queryClient.clear()
      authStore.setSesi(token, {
        id: admin.id,
        nama_lengkap: admin.nama_lengkap,
        tipe: 'admin',
        peran: admin.peran,
      })
      toast.success(`Selamat datang, ${admin.nama_lengkap}`)
      router.push(authStore.ruteHome)
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- ============ SISI KIRI — Brand & copy portal reseller ============ -->
    <div
      class="relative hidden overflow-hidden bg-landing-ink px-12 py-16 text-landing-mist lg:flex lg:flex-col lg:justify-center">
      <div class="absolute -right-24 -top-24 size-96 rounded-full border border-landing-signal/10" />
      <div class="absolute -bottom-32 -left-16 size-80 rounded-full border border-landing-signal/10" />

      <RouterLink to="/" class="absolute left-12 top-14 z-20 flex flex-col transition-all duration-300">
        <span class="font-display text-3xl font-semibold tracking-tight text-white hover:text-landing-signal">
          Sicakra
        </span>
        <span class="mt-1 text-[11px] uppercase tracking-[0.22em] text-landing-mist/60">
          PT Aqrapana Daya Mandiri
        </span>
      </RouterLink>

      <div class="absolute left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-landing-signal/5 blur-3xl" />

      <div class="relative z-10">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">Portal Mitra Reseller</p>
        <h1 class="mt-6 max-w-md text-3xl font-semibold leading-[1.3] tracking-tight">
          Kelola pelanggan Anda, <span class="text-landing-signal">dalam satu pintu</span>.
        </h1>
        <p class="mt-5 max-w-sm text-sm leading-relaxed text-landing-mist/70">
          Daftarkan pelanggan, pantau status layanan, dan terima notifikasi verifikasi — khusus data milik reseller Anda.
        </p>
        <div class="mt-10 flex items-center gap-4">
          <div class="h-px w-14 bg-landing-signal/70" />
          <span class="font-landing-mono text-[11px] uppercase tracking-[0.25em] text-landing-mist/40">
            Fast • Stable • Reliable
          </span>
        </div>
      </div>
    </div>

    <!-- ============ SISI KANAN — Form login ============ -->
    <div
      class="relative flex min-h-screen items-center justify-center overflow-hidden bg-landing-mist px-6 py-12 sm:py-16 lg:min-h-0">
      <div class="absolute -right-24 -top-24 z-0 h-96 w-96 rounded-full border-2 border-landing-ink/25" />
      <div class="absolute -bottom-28 -left-24 z-0 h-80 w-80 rounded-full border-2 border-landing-ink/25" />

      <div class="absolute z-10 w-full max-w-sm">
        <div class="flex flex-col items-center gap-2 text-center lg:mt-0 lg:text-left">
          <h2 class="font-display text-2xl tracking-tight text-landing-ink sm:text-[26px]">
            Masuk sebagai Reseller
          </h2>
          <p class="mt-1.5 flex items-center gap-1.5 text-sm text-landing-ink/55">
            <Store class="size-4" /> Akun mitra reseller Sicakra
          </p>
        </div>

        <form class="mt-8 space-y-5" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label for="email" class="text-landing-ink/80">Email</Label>
            <Input
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="nama@reseller.id"
              autocomplete="username"
              class="h-11 border-landing-ink/15 bg-white focus-visible:ring-landing-signal"
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-landing-ink/80">Password</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                class="h-11 border-landing-ink/15 bg-white pr-10 focus-visible:ring-landing-signal"
                :aria-invalid="!!errors.password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-landing-ink/20 hover:text-landing-ink"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
          </div>

          <Button
            type="submit"
            class="h-11 w-full rounded-full bg-landing-ink text-sm font-medium text-landing-mist hover:bg-landing-ink/90"
            :disabled="isPending"
          >
            {{ isPending ? 'Memproses...' : 'Masuk' }}
          </Button>
        </form>

        <p class="mt-6 text-center text-xs text-landing-ink/50">
          Admin internal? <RouterLink to="/admin/masuk" class="font-medium text-landing-signal hover:underline">Masuk lewat panel admin</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>