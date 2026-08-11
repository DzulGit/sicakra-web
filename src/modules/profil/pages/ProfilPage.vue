<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Camera, User, Lock, AtSign } from 'lucide-vue-next'
import {
  ubahProfilSchema,
  ubahUsernameSchema,
  buatUbahPasswordSchema,
} from '@/schemas/profil.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useProfil, useUbahProfil, useUbahUsername, useUbahPassword, useUbahFotoProfil } from '../composables/useProfil'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const { data: profil, isLoading } = useProfil()

// State untuk sistem navigasi Tab di kolom kanan
const activeTab = ref<'profil' | 'username' | 'keamanan'>('profil')
const isDialogPasswordTerbuka = ref(false)

// ---------- Form: Ubah Data (Nama & Email) ----------
const { handleSubmit, errors, defineField, setErrors, setValues } = useForm({
  validationSchema: toTypedSchema(ubahProfilSchema),
})
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [email, emailAttrs] = defineField('email')

watch(profil, (nilai) => {
  if (nilai) setValues({ nama_lengkap: nilai.nama_lengkap, email: nilai.email ?? '' })
}, { immediate: true })

const { mutate, isPending } = useUbahProfil()

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => toast.success('Profil berhasil diperbarui.'),
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

// ---------- Form: Ubah Username ----------
const {
  handleSubmit: handleSubmitUsername,
  errors: errorsUsername,
  defineField: defineFieldUsername,
  setErrors: setErrorsUsername,
  setValues: setValuesUsername,
} = useForm({
  validationSchema: toTypedSchema(ubahUsernameSchema),
})
const [username, usernameAttrs] = defineFieldUsername('username')

const isEditingUsername = ref(false)

function resetFormUsername() {
  if (profil.value) setValuesUsername({ username: profil.value?.username ?? '' })
  isEditingUsername.value = false
}

watch(profil, (nilai) => {
  if (nilai) setValuesUsername({ username: nilai.username ?? '' })
}, { immediate: true })

const { mutate: submitUsername, isPending: isPendingUsername } = useUbahUsername()

const onSubmitUsername = handleSubmitUsername((values) => {
  submitUsername(values, {
    onSuccess: () => toast.success('Username berhasil diperbarui.'),
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsUsername(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

// ---------- Form: Ubah Password ----------
const wajibPasswordLama = computed(() => profil.value?.password_sudah_dibuat === true)

const {
  handleSubmit: handleSubmitPassword,
  errors: errorsPassword,
  defineField: defineFieldPassword,
  setErrors: setErrorsPassword,
  resetForm: resetFormPassword,
} = useForm({
  validationSchema: computed(() => toTypedSchema(buatUbahPasswordSchema(wajibPasswordLama.value))),
})
const [passwordLama, passwordLamaAttrs] = defineFieldPassword('password_lama')
const [passwordBaru, passwordBaruAttrs] = defineFieldPassword('password')
const [passwordKonfirmasi, passwordKonfirmasiAttrs] = defineFieldPassword('password_confirmation')

const { mutate: submitPassword, isPending: isPendingPassword } = useUbahPassword()

const onSubmitPassword = handleSubmitPassword((values) => {
  submitPassword(values, {
    onSuccess: () => {
      toast.success('Password berhasil diperbarui.')
      resetFormPassword()
      isDialogPasswordTerbuka.value = false
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsPassword(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

const isEditingPassword = ref(false)

// ---------- Unggah Foto Profil (UI Mockup) ----------
const inputFotoRef = ref<HTMLInputElement | null>(null)
function pemicuPilihFoto() {
  inputFotoRef.value?.click()
}

const { mutate: uploadFoto } = useUbahFotoProfil()

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('foto', file)
    
    uploadFoto(formData, {
      onSuccess: () => toast.success('Foto profil berhasil diubah.'),
      onError: () => toast.error('Gagal mengunggah foto.')
    })
  }
}

// Helper Foto (sementara)
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
      <!-- Ornamen grafis opsional -->
      <div class="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
    </div>

    <!-- Main Content Container (Pulled up to overlap banner) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 md:-mt-24 px-2 md:px-6 relative z-10">
      
      <!-- Kolom Kiri: Kartu Identitas Profil -->
      <div class="space-y-6 md:col-span-1">
        <Card class="shadow-sm">
          <CardContent class="pt-6 flex flex-col items-center text-center">
            <!-- Avatar Interaktif -->
            <div class="relative mb-4 group cursor-pointer" @click="pemicuPilihFoto">
              <div class="h-28 w-28 rounded-full overflow-hidden border-4 border-background bg-muted">
                <img :src="urlFotoProfil" alt="Foto Profil" class="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
              </div>
              <!-- Badge Kamera -->
              <div class="absolute bottom-1 right-1 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110">
                <Camera class="size-4" />
              </div>
              <input type="file" ref="inputFotoRef" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>

            <h2 class="text-xl font-semibold tracking-tight">{{ profil?.nama_lengkap }}</h2>
            <p class="text-sm text-muted-foreground mb-4">Pelanggan Sicakra</p>
            
            <Separator class="w-full mb-4" />

            <!-- Informasi Statis -->
            <div class="w-full space-y-3 text-sm text-left">
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground">Nomor Pelanggan</span>
                <span class="font-medium">{{ profil?.nomor_pelanggan }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground">NIK</span>
                <span class="font-medium">{{ profil?.nik }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-muted-foreground">Nomor WhatsApp</span>
                <span class="font-medium">{{ profil?.nomor_hp }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Kolom Kanan: Pengaturan Akun dengan Tab -->
      <div class="md:col-span-2">
        <Card class="shadow-sm min-h-full">
          <!-- Custom Tab Header -->
          <div class="flex border-b overflow-x-auto">
            <button 
              @click="activeTab = 'profil'" 
              :class="['px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap', activeTab === 'profil' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground']">
              Pengaturan Akun
            </button>
            <button 
              @click="activeTab = 'username'" 
              :class="['px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap', activeTab === 'username' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground']">
              Ubah Username
            </button>
            <button 
              @click="activeTab = 'keamanan'" 
              :class="['px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap', activeTab === 'keamanan' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground']">
              Keamanan
            </button>
          </div>

          <CardContent class="pt-6">
            <!-- TAB: PROFIL -->
            <div v-if="activeTab === 'profil'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-4">
                <h3 class="text-lg font-medium">Data Diri</h3>
                <p class="text-sm text-muted-foreground">Perbarui informasi kontak dan data diri Anda.</p>
              </div>
              <form class="space-y-4 max-w-md" novalidate @submit="onSubmit">
                <div class="space-y-2">
                  <Label for="nama_lengkap">Nama Lengkap</Label>
                  <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" :aria-invalid="!!errors.nama_lengkap" />
                  <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="email">Alamat Email</Label>
                  <Input id="email" v-model="email" v-bind="emailAttrs" type="email" :aria-invalid="!!errors.email" />
                  <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
                </div>
                <Button type="submit" class="mt-2" :disabled="isPending">
                  <User class="size-4 mr-2" /> {{ isPending ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </Button>
              </form>
            </div>

            <!-- TAB: USERNAME -->
            <div v-else-if="activeTab === 'username'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium">Username Login</h3>
                  <p class="text-sm text-muted-foreground">Ubah username yang digunakan untuk masuk ke aplikasi.</p>
                </div>
                <Button v-if="!isEditingUsername" variant="outline" size="sm" @click="isEditingUsername = true">
                  Edit
                </Button>
              </div>
              
              <!-- Mode Baca -->
              <div v-if="!isEditingUsername" class="rounded-lg border p-4 max-w-md">
                <p class="text-sm text-muted-foreground">Username saat ini</p>
                <p class="font-medium text-base mt-1">{{ profil?.username }}</p>
              </div>

              <!-- Mode Edit -->
              <form v-else class="space-y-4 max-w-md p-4 border rounded-lg" novalidate @submit="onSubmitUsername">
                <div class="space-y-2">
                  <Label for="username">Username Baru</Label>
                  <Input id="username" v-model="username" v-bind="usernameAttrs" autocomplete="username" :aria-invalid="!!errorsUsername.username" />
                  <p v-if="errorsUsername.username" class="text-xs text-destructive">{{ errorsUsername.username }}</p>
                </div>
                <div class="flex gap-2">
                  <Button type="button" variant="outline" @click="resetFormUsername(); isEditingUsername = false">Batal</Button>
                  <Button type="submit" :disabled="isPendingUsername">
                    <AtSign class="size-4 mr-2" /> {{ isPendingUsername ? 'Menyimpan...' : 'Update Username' }}
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

              <!-- Mode Baca -->
              <div v-if="!isEditingPassword" class="rounded-lg border p-4 flex items-center justify-between max-w-md">
                <div class="space-y-1">
                  <p class="text-sm font-medium">Password Akun</p>
                  <p class="text-sm text-muted-foreground">Kelola kata sandi akun Anda.</p>
                </div>
                <Button variant="outline" @click="isEditingPassword = true">
                  <Lock class="size-4 mr-2" /> Ganti Password
                </Button>
              </div>

              <!-- Mode Edit (Inline Form) -->
              <form v-else class="space-y-4 max-w-md p-4 border rounded-lg" novalidate @submit="onSubmitPassword">
                <div v-if="wajibPasswordLama" class="space-y-2">
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

  <!-- Modal Dialog: Ubah Password -->
  <Dialog :open="isDialogPasswordTerbuka" @update:open="isDialogPasswordTerbuka = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Ubah Password</DialogTitle>
        <DialogDescription>
          {{ wajibPasswordLama ? 'Masukkan password lama untuk mengganti password.' : 'Kamu belum pernah ganti password — cukup buat password baru.' }}
        </DialogDescription>
      </DialogHeader>
      <form class="space-y-4 mt-2" novalidate @submit="onSubmitPassword">
        <div v-if="wajibPasswordLama" class="space-y-2">
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
        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" @click="isDialogPasswordTerbuka = false">Batal</Button>
          <Button type="submit" :disabled="isPendingPassword">
            {{ isPendingPassword ? 'Menyimpan...' : 'Simpan Password' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>