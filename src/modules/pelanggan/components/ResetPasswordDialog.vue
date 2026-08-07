<script setup lang="ts">
import { ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Check, Copy, KeyRound, Loader2 } from 'lucide-vue-next'
import { useResetAkun } from '../composables/usePelanggan'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { ApiErrorResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'

const props = defineProps<{
  open: boolean
  pelanggan: Pelanggan | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { mutate: resetAkun, isPending } = useResetAkun()

const nilaiBaru = ref('')
const tercopy = ref(false)
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    nilaiBaru.value = ''
    tercopy.value = false
    error.value = ''
  },
)

function tutup() {
  if (!isPending.value) emit('update:open', false)
}

function reset() {
  if (!props.pelanggan) return
  error.value = ''
  resetAkun(props.pelanggan.id, {
    onSuccess: (data) => {
      nilaiBaru.value = data.username
    },
    onError: (e: Error) => {
      const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
      toast.error(pesan ?? 'Gagal reset akun.')
    },
  })
}

async function salin() {
  await navigator.clipboard.writeText(nilaiBaru.value)
  tercopy.value = true
  toast.success('Berhasil disalin.')
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !isPending && emit('update:open', v)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <KeyRound class="size-5" /> Reset Username &amp; Password
        </DialogTitle>
        <DialogDescription>
          {{
            nilaiBaru
              ? 'Salin username & password baru lalu serahkan ke pelanggan.'
              : `Reset akun ${pelanggan?.nama_lengkap ?? '-'}? Username dan password baru akan diset sama, 6 karakter acak.`
          }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="nilaiBaru" class="space-y-3">
        <div class="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3">
          <div class="flex-1 space-y-1">
            <div class="grid grid-cols-[auto_1fr] items-center gap-2">
              <span class="text-xs text-muted-foreground">Username</span>
              <code class="font-mono text-lg font-semibold tracking-widest">{{ nilaiBaru }}</code>
            </div>
            <div class="grid grid-cols-[auto_1fr] items-center gap-2">
              <span class="text-xs text-muted-foreground">Password</span>
              <code class="font-mono text-lg font-semibold tracking-widest">{{ nilaiBaru }}</code>
            </div>
          </div>
          <Button size="sm" variant="outline" @click="salin">
            <Check v-if="tercopy" class="size-4" />
            <Copy v-else class="size-4" />
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          Username &amp; password sama. Berisi huruf kecil/besar dan angka, tanpa karakter yang
          mudah tertukar (i, I, l, L, o, O, 0, 1). Disarankan disampaikan ke pelanggan lewat telepon/WA.
        </p>
      </div>

      <p v-else-if="error" class="text-sm font-medium text-destructive">{{ error }}</p>

      <DialogFooter>
        <template v-if="nilaiBaru">
          <Button variant="outline" @click="tutup">Tutup</Button>
        </template>
        <template v-else>
          <Button variant="outline" :disabled="isPending" @click="tutup">Batal</Button>
          <Button :disabled="isPending" @click="reset">
            <Loader2 v-if="isPending" class="mr-2 size-4 animate-spin" />
            {{ isPending ? 'Mereset...' : 'Reset Username &amp; Password' }}
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>