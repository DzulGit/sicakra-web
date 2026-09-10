<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Camera, User, Lock, AtSign, Store } from 'lucide-vue-next'
import {
  ubahNamaResellerSchema,
  mintaEmailResellerSchema,
  ubahPasswordResellerSchema,
  type UbahNamaResellerForm,
  type MintaEmailResellerForm,
} from '@/schemas/profil-reseller.schema'
import { mapValidationErrors } from '@/lib/errors'
import {
  useProfilReseller,
  useUbahNamaReseller,
  useMintaUbahEmailReseller,
  useBatalUbahEmailReseller,
  useUbahPasswordReseller,
  useUbahFotoReseller,
} from '../composables/useProfilReseller'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const { data: profil, isLoading } = useProfilReseller()

const activeTab = ref<'profil' | 'keamanan'>('profil')

// ---------- Form: Nama ----------
const {
  handleSubmit: onSubmitNamaRaw,
  errors,
  defineField,
  setErrors: setErrorsNama,
  setValues,
} = useForm<UbahNamaResellerForm>({
  validationSchema: toTypedSchema(ubahNamaResellerSchema),
})
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')

// ---------- Form: Ganti Email ----------
const {
  handleSubmit: onSubmitEmailRaw,
  errors: errorsEmail,
  defineField: defineFieldEmail,
  setErrors: setErrorsEmail,
} = useForm<MintaEmailResellerForm>({
  validationSchema: toTypedSchema(mintaEmailResellerSchema),
})
const [email, emailAttrs] = defineFieldEmail('email')

watch(profil, (nilai) => {
  if (nilai) setValues({ nama_lengkap: nilai.nama_lengkap })
}, { immediate: true })

watch(profil, (nilai) => {
  if (nilai && !nilai.email_baru) email.value = nilai.email
}, { immediate: true })

const emailMenunggu = computed(() => !!profil.value?.email_baru)

const { mutate: simpanNama } = useUbahNamaReseller()
const onSubmitNama = onSubmitNamaRaw((values) => {
  simpanNama({ nama_lengkap: values.nama_lengkap }, {
    onSuccess: () => toast.success('Nama berhasil diperbarui.'),
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsNama(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

const { mutate: mintaEmail, isPending: pendingMintaEmail } = useMintaUbahEmailReseller()
const onSubmitEmail = onSubmitEmailRaw((values) => {
  mintaEmail({ email: values.email }, {
    onSuccess: () => {
      toast.success('Permintaan ganti email dikirim. Menunggu persetujuan Admin Operasional.')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsEmail(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

const { mutate: batalEmail, isPending: pendingBatalEmail } = useBatalUbahEmailReseller()
function onBatalEmail() {
  batalEmail(undefined, {
    onSuccess: () => {
      toast.success('Permintaan ganti email dibatalkan.')
      email.value = profil.value?.email ?? ''
    },
    onError: () => toast.error('Terjadi kesalahan, coba lagi.'),
  })
}

// ---------- Form: Ganti Password ----------
const {
  handleSubmit: handleSubmitPassword,
  errors: errorsPassword,
  defineField: defineFieldPassword,
  setErrors: setErrorsPassword,
  resetForm: resetFormPassword,
} = useForm({
  validationSchema: toTypedSchema(ubahPasswordResellerSchema),
})
const [passwordLama, passwordLamaAttrs] = defineFieldPassword('password_lama')
const [passwordBaru, passwordBaruAttrs] = defineFieldPassword('password')
const [passwordKonfirmasi, passwordKonfirmasiAttrs] = defineFieldPassword('password_confirmation')

const { mutate: submitPassword, isPending: isPendingPassword } = useUbahPasswordReseller()
const isEditingPassword = ref(false)

const onSubmitPassword = handleSubmitPassword((values) => {
  submitPassword(values, {
    onSuccess: () => {
      toast.success('Password berhasil diperbarui.')
      resetFormPassword()
      isEditingPassword.value = false
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsPassword(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

// ---------- Unggah Foto Profil ----------
const inputFotoRef = ref<HTMLInputElement | null>(null)
function pemicuPilihFoto() {
  inputFotoRef.value?.click()
}

const { mutate: uploadFoto } = useUbahFotoReseller()
function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('foto', file)
    uploadFoto(formData, {
      onSuccess: () => toast.success('Foto profil berhasil diubah.'),
      onError: () => toast.error('Gagal mengunggah foto.'),
    })
  }
}

const urlFotoProfil = computed(() => {
  const foto = profil.value?.foto_profil
  if (!foto) return `https://api.dicebear.com/7.x/initials/svg?seed=${profil.value?.nama_lengkap}&backgroundColor=0f172a`
  return foto.startsWith('http') ? foto : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${foto}`
})
</script>

<template>
  <div v-if="isLoading" class="space-y-6">
    <Skeleton class="h-40 w-full rounded-xl" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton class="h-72 w-full md:col-span-1" />
      <Skeleton class="h-96 w-full md:col-span-2" />
    </div>
  </div>

  <div v-else class="space-y-6 relative">
    <!-- Top Banner -->
    <div class="h-32 md:h-48 w-full bg-primary/10 rounded-xl relative overflow-hidden border">
      <div class="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
    </div>

    <!-- Main Content Container -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 md:-mt-24 px-2 md:px-6 relative z-10">
      <!-- Kolom Kiri: Kartu Identitas -->
      <div class="space-y-6 md:col-span-1">
        <Card class="shadow-sm">
          <CardContent class="pt-6 flex flex-col items-center text-center">
            <div class="relative mb-4 group cursor-pointer" @click="pemicuPilihFoto">
              <div class="h-28 w-28 rounded-full overflow-hidden border-4 border-background bg-muted">
                <img :src="urlFotoProfil" alt="Foto Profil" class="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
              </div>
              <div class="absolute bottom-1 right-1 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110">
                <Camera class="size-4" />
              </div>
              <input type="file" ref="inputFotoRef" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>

            <h2 class="text-xl font-semibold tracking-tight">{{ profil?.nama_lengkap }}</h2>
            <p class="text-sm text-muted-foreground mb-4">Reseller Sicakra</p>

            <Separator class="w-full mb-4" />

            <div class="w-full space-y-3 text-sm text-left">
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground">Email Terdaftar</span>
                <span class="font-medium">{{ profil?.email }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Status Akun</span>
                <span class="font-medium"><Store class="size-3.5 inline mr-1" />Reseller</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Kolom Kanan -->
      <div class="md:col-span-2">
        <Card class="shadow-sm min-h-full">
          <!-- Tab Header -->
          <div class="flex border-b overflow-x-auto">
            <button
              @click="activeTab = 'profil'"
              :class="['px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap', activeTab === 'profil' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground']"
            >
              Pengaturan Akun
            </button>
            <button
              @click="activeTab = 'keamanan'"
              :class="['px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap', activeTab === 'keamanan' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground']"
            >
              Keamanan
            </button>
          </div>

          <CardContent class="pt-6">
            <!-- TAB: PROFIL -->
            <div v-if="activeTab === 'profil'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-4">
                <h3 class="text-lg font-medium">Data Diri</h3>
                <p class="text-sm text-muted-foreground">Perbarui nama dan alamat email Anda.</p>
              </div>

              <form class="space-y-4 max-w-md" novalidate @submit="onSubmitNama">
                <div class="space-y-2">
                  <Label for="nama_lengkap">Nama Lengkap</Label>
                  <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" :aria-invalid="!!errors.nama_lengkap" />
                  <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
                </div>
                <Button type="submit" class="mt-2">
                  <User class="size-4 mr-2" /> Simpan Nama
                </Button>
              </form>

              <!-- Ganti Email -->
              <div class="mt-8 mb-4">
                <h3 class="text-lg font-medium">Alamat Email</h3>
                <p class="text-sm text-muted-foreground">
                  Ganti email? Ajukan permintaan — harus disetujui Admin Operasional dulu.
                </p>
              </div>

              <div v-if="emailMenunggu" class="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3 max-w-md">
                <div class="flex items-center gap-2">
                  <Badge variant="warning">Menunggu Persetujuan</Badge>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Permintaan email baru ke:</p>
                  <p class="font-medium">{{ profil?.email_baru }}</p>
                </div>
                <p class="text-xs text-muted-foreground">
                  Admin Operasional akan menyetujui atau menolak perubahan ini. Anda masih login dengan email lama.
                </p>
                <Button type="button" variant="outline" size="sm" :disabled="pendingBatalEmail" @click="onBatalEmail">
                  Batalkan Permintaan
                </Button>
              </div>

              <form v-else class="space-y-4 max-w-md" novalidate @submit="onSubmitEmail">
                <div class="space-y-2">
                  <Label for="email">Email Baru</Label>
                  <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="email-baru@contoh.com" :aria-invalid="!!errorsEmail.email" />
                  <p v-if="errorsEmail.email" class="text-xs text-destructive">{{ errorsEmail.email }}</p>
                </div>
                <div class="flex gap-2">
                  <Button type="submit" :disabled="pendingMintaEmail">
                    <AtSign class="size-4 mr-2" /> {{ pendingMintaEmail ? 'Mengirim...' : 'Ajukan Ganti Email' }}
                  </Button>
                </div>
              </form>
            </div>

            <!-- TAB: KEAMANAN -->
            <div v-else-if="activeTab === 'keamanan'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-4">
                <h3 class="text-lg font-medium">Keamanan Akun</h3>
                <p class="text-sm text-muted-foreground">Amankan akun Anda dengan mengganti password secara berkala.</p>
              </div>

              <div v-if="!isEditingPassword" class="rounded-lg border p-4 flex items-center justify-between max-w-md">
                <div class="space-y-1">
                  <p class="text-sm font-medium">Password Akun</p>
                  <p class="text-sm text-muted-foreground">Kelola kata sandi akun Anda.</p>
                </div>
                <Button variant="outline" @click="isEditingPassword = true">
                  <Lock class="size-4 mr-2" /> Ganti Password
                </Button>
              </div>

              <form v-else class="space-y-4 max-w-md p-4 border rounded-lg" novalidate @submit="onSubmitPassword">
                <div class="space-y-2">
                  <Label for="password_lama">Password Lama</Label>
                  <Input id="password_lama" v-model="passwordLama" v-bind="passwordLamaAttrs" type="password" autocomplete="current-password" :aria-invalid="!!errorsPassword.password_lama" />
                  <p v-if="errorsPassword.password_lama" class="text-xs text-destructive">{{ errorsPassword.password_lama }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="password_baru">Password Baru</Label>
                  <Input id="password_baru" v-model="passwordBaru" v-bind="passwordBaruAttrs" type="password" placeholder="Minimal 8 karakter" autocomplete="new-password" :aria-invalid="!!errorsPassword.password" />
                  <p v-if="errorsPassword.password" class="text-xs text-destructive">{{ errorsPassword.password }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="password_confirmation">Konfirmasi Password Baru</Label>
                  <Input id="password_confirmation" v-model="passwordKonfirmasi" v-bind="passwordKonfirmasiAttrs" type="password" autocomplete="new-password" :aria-invalid="!!errorsPassword.password_confirmation" />
                  <p v-if="errorsPassword.password_confirmation" class="text-xs text-destructive">{{ errorsPassword.password_confirmation }}</p>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" @click="resetFormPassword(); isEditingPassword = false">Batal</Button>
                  <Button type="submit" :disabled="isPendingPassword">
                    {{ isPendingPassword ? 'Menyimpan...' : 'Simpan Password' }}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>