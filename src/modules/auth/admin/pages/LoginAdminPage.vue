<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { loginAdminSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'
import { useLoginAdmin } from '../composables/useAdminAuth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(loginAdminSchema),
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const { mutate: login, isPending } = useLoginAdmin()
const showPassword = ref(false)

// Halaman default per peran setelah login — cermin rute Fase-5-9.
const rutePerPeran: Record<string, string> = {
  super_admin: '/admin/super-admin/admin',
  operasional: '/admin/operasional/permohonan-layanan',
  teknisi: '/admin/teknisi/jadwal-kerja',
  keuangan: '/admin/keuangan/tagihan',
}

const onSubmit = handleSubmit((values) => {
  login(values, {
    onSuccess: ({ data }) => {
      const { admin, token } = data.data
      authStore.setSesi(token, {
        id: admin.id,
        nama_lengkap: admin.nama_lengkap,
        tipe: 'admin',
        peran: admin.peran,
      })
      toast.success(`Selamat datang, ${admin.nama_lengkap}`)
      router.push(rutePerPeran[admin.peran] ?? '/admin/masuk')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) {
        setErrors(fieldErrors)
      } else {
        toast.error('Terjadi kesalahan, coba lagi.')
      }
    },
  })
})
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- ============ SISI KIRI — Brand & pesan ============ -->
    <div class="relative hidden overflow-hidden bg-landing-ink px-12 py-16 text-landing-mist lg:flex lg:flex-col lg:justify-center">
      <div class="absolute -right-24 -top-24 size-96 rounded-full border border-landing-signal/10" />
      <div class="absolute -bottom-32 -left-16 size-80 rounded-full border border-landing-signal/10" />

      <RouterLink to="/" class="absolute left-12 top-16 z-10 flex items-center gap-2.5">
        <img src="/logo-sicakra.png" alt="Sicakra" class="h-9 w-auto" />
        <span class="font-display text-lg tracking-tight">Sicakra</span>
      </RouterLink>

      <div class="relative z-10">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">
          Panel Internal
        </p>
        <h1 class="mt-6 max-w-md font-display text-4xl leading-[1.1] tracking-tight">
          Kelola operasional <em class="italic text-landing-signal">tanpa hambatan</em>.
        </h1>
        <p class="mt-6 max-w-sm text-sm text-landing-mist/60">
          Masuk sebagai Operasional, Teknisi, Keuangan, atau Super Admin untuk mengakses panel
          kerja kamu.
        </p>
      </div>
    </div>

    <!-- ============ SISI KANAN — Form login ============ -->
    <div class="flex min-h-screen items-center justify-center bg-landing-mist px-6 py-12 sm:py-16 lg:min-h-0">
      <div class="w-full max-w-sm">
        <RouterLink to="/" class="flex flex-col items-center gap-2 text-center lg:hidden">
          <img src="/logo-sicakra.png" alt="Sicakra" class="h-11 w-auto" />
        </RouterLink>

        <div class="mt-8 text-center lg:mt-0 lg:text-left">
          <h2 class="font-display text-2xl tracking-tight text-landing-ink sm:text-[26px]">
            Masuk sebagai Admin
          </h2>
          <p class="mt-1.5 text-sm text-landing-ink/55">
            Operasional, Teknisi, Keuangan, atau Super Admin
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
              placeholder="nama@sicakra.id"
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
                class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-landing-ink/40 hover:text-landing-ink"
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
      </div>
    </div>
  </div>
</template>