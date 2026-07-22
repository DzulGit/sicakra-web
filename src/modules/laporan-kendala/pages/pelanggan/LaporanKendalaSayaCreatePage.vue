<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { buatLaporanSchema } from '@/schemas/laporan-kendala.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useBuatLaporanKendala } from '../../composables/usePelangganLaporanKendala'
import { useLayananSayaList } from '@/modules/layanan-internet/composables/usePelangganLayanan'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const router = useRouter()

// Hanya butuh daftar layanan aktif milik pelanggan untuk dropdown — cukup halaman pertama,
// realistisnya pelanggan tidak punya puluhan layanan sekaligus.
const { data: layananSaya } = useLayananSayaList()

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(buatLaporanSchema),
})
const [layananInternetId, layananInternetIdAttrs] = defineField('layanan_internet_id')
const [kategoriKendala, kategoriKendalaAttrs] = defineField('kategori_kendala')
const [deskripsi, deskripsiAttrs] = defineField('deskripsi')

const { mutate, isPending } = useBuatLaporanKendala()

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => {
      toast.success('Laporan berhasil dikirim, tim kami akan segera menindaklanjuti.')
      router.push('/pelanggan/laporan-kendala')
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
  <Card class="max-w-lg">
    <CardHeader>
      <CardTitle>Buat Laporan Kendala</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label>Layanan</Label>
          <Select v-model="layananInternetId" v-bind="layananInternetIdAttrs">
            <SelectTrigger><SelectValue placeholder="Pilih layanan yang bermasalah" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="l in layananSaya?.data ?? []" :key="l.id" :value="String(l.id)">
                {{ l.nomor_layanan }} — {{ l.alamat_pemasangan }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.layanan_internet_id" class="text-xs text-destructive">
            {{ errors.layanan_internet_id }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="kategori_kendala">Kategori Kendala</Label>
          <Input
            id="kategori_kendala"
            v-model="kategoriKendala"
            v-bind="kategoriKendalaAttrs"
            placeholder="mis. Internet Lambat, Tidak Ada Sinyal"
            :aria-invalid="!!errors.kategori_kendala"
          />
          <p v-if="errors.kategori_kendala" class="text-xs text-destructive">{{ errors.kategori_kendala }}</p>
        </div>
        <div class="space-y-2">
          <Label for="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            v-model="deskripsi"
            v-bind="deskripsiAttrs"
            placeholder="Jelaskan kendala yang kamu alami"
          />
          <p v-if="errors.deskripsi" class="text-xs text-destructive">{{ errors.deskripsi }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Mengirim...' : 'Kirim Laporan' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
