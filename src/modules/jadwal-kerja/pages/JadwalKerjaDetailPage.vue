<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { CheckCircle2, Copy } from 'lucide-vue-next'
import { hasilKerjaSchema } from '@/schemas/jadwal-kerja.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useIsiHasilKerja, useJadwalKerjaDetail } from '@/modules/jadwal-kerja/composables/useJadwalKerja'
import { hasilKerjaEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import type { RingkasanAktivasi } from '@/types/models'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: jadwal, isLoading } = useJadwalKerjaDetail(id)

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(hasilKerjaSchema),
})
const [hasilField, hasilFieldAttrs] = defineField('hasil')
const [catatanKendala, catatanKendalaAttrs] = defineField('catatan_kendala')

const { mutate, isPending } = useIsiHasilKerja()
const ringkasanAktivasi = ref<RingkasanAktivasi | null>(null)

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: id.value, payload: values },
    {
      onSuccess: ({ data }) => {
        if (data.data.ringkasan_aktivasi) {
          ringkasanAktivasi.value = data.data.ringkasan_aktivasi
        } else {
          toast.success('Kendala dicatat — Operasional akan jadwalkan ulang.')
          router.push('/admin/teknisi/jadwal-kerja')
        }
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})

function salinUsername() {
  if (!ringkasanAktivasi.value?.nomor_pelanggan) return
  navigator.clipboard.writeText(ringkasanAktivasi.value.nomor_pelanggan)
  toast.success('Username disalin.')
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <!-- Kartu ringkasan aktivasi — muncul begitu teknisi tandai "Selesai", TETAP
       di layar (bukan auto-redirect) supaya bisa dibacakan ke pelanggan di lokasi. -->
  <div v-else-if="ringkasanAktivasi" class="max-w-md space-y-6">
    <Card class="border-success">
      <CardHeader>
        <div class="flex items-center gap-2 text-success">
          <CheckCircle2 class="size-5" />
          <CardTitle class="text-base">Pemasangan Selesai — Layanan Aktif</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4 text-sm">
        <div>
          <p class="text-muted-foreground">Username / Nomor Pelanggan</p>
          <div class="flex items-center gap-2">
            <p class="font-mono text-lg font-semibold">{{ ringkasanAktivasi.nomor_pelanggan }}</p>
            <Button type="button" variant="ghost" size="icon" @click="salinUsername">
              <Copy class="size-4" />
            </Button>
          </div>
        </div>
        <div>
          <p class="text-muted-foreground">Pelanggan</p>
          <p class="font-medium">{{ ringkasanAktivasi.nama_pelanggan }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Paket</p>
          <p>{{ ringkasanAktivasi.nama_paket }} ({{ ringkasanAktivasi.kecepatan_mbps }} Mbps)</p>
        </div>
        <div>
          <p class="text-muted-foreground">Status</p>
          <p class="capitalize">{{ ringkasanAktivasi.status }}</p>
        </div>
        <p class="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          Sampaikan ke pelanggan: username di atas dipakai untuk login pertama kali di dashboard
          pelanggan (bersama nomor HP terdaftar), lalu pelanggan akan diminta buat password sendiri.
        </p>
      </CardContent>
    </Card>
    <Button class="w-full" @click="router.push('/admin/teknisi/jadwal-kerja')">
      Kembali ke Daftar Jadwal Kerja
    </Button>
  </div>

  <div v-else-if="jadwal" class="max-w-xl space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ jadwal.permohonan_layanan?.nomor_permohonan }}</CardTitle>
        <p class="text-sm text-muted-foreground">
          {{ jadwal.permohonan_layanan?.pelanggan?.nama_lengkap }}
        </p>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div>
          <p class="text-muted-foreground">Alamat</p>
          <p>{{ jadwal.permohonan_layanan?.alamat_pemasangan }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Rekan Satu Tim</p>
          <p>{{ (jadwal.teknisi ?? []).map((t) => t.nama_lengkap).join(', ') || '-' }}</p>
        </div>
      </CardContent>
    </Card>

    <Card v-if="jadwal.hasil">
      <CardHeader>
        <CardTitle class="text-base">Hasil Sudah Diisi</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <StatusBadge :value="jadwal.hasil" :map="hasilKerjaEnum" />
        <p v-if="jadwal.catatan_kendala" class="text-sm text-muted-foreground">{{ jadwal.catatan_kendala }}</p>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">Isi Hasil Kunjungan</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label>Hasil</Label>
            <Select v-model="hasilField" v-bind="hasilFieldAttrs">
              <SelectTrigger><SelectValue placeholder="Pilih hasil" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="selesai">Selesai — Pasang Berhasil</SelectItem>
                <SelectItem value="kendala">Ada Kendala</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.hasil" class="text-xs text-destructive">{{ errors.hasil }}</p>
          </div>
          <div class="space-y-2">
            <Label for="catatan_kendala">Catatan Kendala</Label>
            <Textarea
              id="catatan_kendala"
              v-model="catatanKendala"
              v-bind="catatanKendalaAttrs"
              placeholder="Wajib diisi kalau ada kendala — mis. akses rumah, tiang penuh, pelanggan tidak di tempat"
            />
            <p v-if="errors.catatan_kendala" class="text-xs text-destructive">{{ errors.catatan_kendala }}</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Simpan Hasil' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>