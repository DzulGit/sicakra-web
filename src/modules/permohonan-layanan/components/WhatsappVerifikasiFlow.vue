<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { verifikasiDanJadwalkanSchema } from '@/schemas/permohonan-layanan.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftarTeknisi, useVerifikasiDanJadwalkan, generateWaMessage } from '../composables/usePermohonanLayanan'
import { useTimTeknisiAktif } from '@/modules/tim-teknisi/composables/useTimTeknisi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import type { PermohonanLayanan } from '@/types/models'

const props = defineProps<{ permohonan: PermohonanLayanan }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const langkah = ref<'wa' | 'form'>('wa')
const waMessage = computed(() => generateWaMessage(props.permohonan))

const { data: daftarTeknisi } = useDaftarTeknisi()
const { data: daftarTim } = useTimTeknisiAktif()

const { handleSubmit, errors, defineField, setErrors, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(verifikasiDanJadwalkanSchema),
  initialValues: {
    status: 'DITERIMA',
    teknisi_ids: [],
    tipe_paket: props.permohonan.tipe_paket,
    jenis_permohonan: props.permohonan.jenis_permohonan
  },
})

const [status, statusAttrs] = defineField('status')
const [catatan, catatanAttrs] = defineField('catatan')
const [timTeknisiId, timTeknisiIdAttrs] = defineField('tim_teknisi_id')
const [tanggalKerja, tanggalKerjaAttrs] = defineField('tanggal_kerja')
const [hargaCustom, hargaCustomAttrs] = defineField('harga_custom')

function pilihTim(timId: string) {
  setFieldValue('tim_teknisi_id', timId)
  const tim = daftarTim.value?.find((t) => String(t.id) === timId)
  if (tim) {
    setFieldValue('teknisi_ids', (tim.anggota ?? []).map((a) => a.id))
  }
}

const teknisiDropdownOpen = ref(false)
const teknisiSearch = ref('')
const teknisiDropdownRef = ref<HTMLElement | null>(null)

const teknisiTerfilter = computed(() => {
  const keyword = teknisiSearch.value.trim().toLowerCase()

  if (!keyword) return daftarTeknisi.value ?? []

  return (daftarTeknisi.value ?? []).filter((teknisi) =>
    teknisi.nama_lengkap.toLowerCase().includes(keyword),
  )
})

const teknisiTerpilih = computed(() => {
  const selectedIds = values.teknisi_ids ?? []

  return (daftarTeknisi.value ?? []).filter((teknisi) =>
    selectedIds.some((id) => String(id) === String(teknisi.id)),
  )
})

function teknisiTerpilihCheck(id: string | number) {
  return (values.teknisi_ids ?? []).some((selectedId) => String(selectedId) === String(id))
}

function toggleTeknisi(id: string | number) {
  const currentIds = [...(values.teknisi_ids ?? [])]
  const index = currentIds.findIndex((selectedId) => String(selectedId) === String(id))

  if (index >= 0) {
    currentIds.splice(index, 1)
  } else {
    const teknisi = (daftarTeknisi.value ?? []).find((item) => String(item.id) === String(id))
    if (teknisi) currentIds.push(teknisi.id)
  }

  setFieldValue('teknisi_ids', currentIds)
}

function hapusTeknisi(id: string | number) {
  setFieldValue(
    'teknisi_ids',
    (values.teknisi_ids ?? []).filter((selectedId) => String(selectedId) !== String(id)),
  )
}

function bukaDropdownTeknisi() {
  teknisiDropdownOpen.value = true
}

function tutupDropdownTeknisi() {
  teknisiDropdownOpen.value = false
  teknisiSearch.value = ''
}

function handleTeknisiOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (teknisiDropdownRef.value && !teknisiDropdownRef.value.contains(target)) {
    tutupDropdownTeknisi()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleTeknisiOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleTeknisiOutsideClick)
})

const { mutate, isPending } = useVerifikasiDanJadwalkan()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    { id: props.permohonan.id, payload: formValues },
    {
      onSuccess: () => {
        toast.success(
          formValues.status === 'DITERIMA'
            ? 'Permohonan diterima & jadwal kerja telah dibuat.'
            : 'Verifikasi berhasil disimpan.',
        )
        emit('close')
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})

function bukaWhatsApp() {
  if (waMessage.value.waUrl) window.open(waMessage.value.waUrl, '_blank')
}

const butuhJadwal = computed(() => values.status === 'DITERIMA')

function salinPesan() {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(waMessage.value.text)
    toast.success('Pesan disalin')
  } else {
    toast.error('Gagal menyalin pesan')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span :class="langkah === 'wa' ? 'font-semibold text-foreground' : ''">1. Kirim WhatsApp</span>
      <span class="text-xs">→</span>
      <span :class="langkah === 'form' ? 'font-semibold text-foreground' : ''">2. Konfirmasi & Jadwalkan</span>
    </div>

    <template v-if="langkah === 'wa'">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Pesan WhatsApp</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4 text-sm">
            <div>
              <p class="text-xs text-muted-foreground">Pelanggan</p>
              <p class="font-medium">{{ permohonan.pelanggan?.nama_lengkap }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">No. WhatsApp</p>
              <p class="font-medium">{{ permohonan.pelanggan?.nomor_hp }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Paket</p>
              <p class="font-medium">
                {{ permohonan.tipe_paket === 'reguler' ? permohonan.paket_internet?.nama_paket :
                  permohonan.nama_paket_custom }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">No. Permohonan</p>
              <p class="font-medium">{{ permohonan.nomor_permohonan }}</p>
            </div>
          </div>

          <Textarea :model-value="waMessage.text" rows="12" class="font-mono text-xs" readonly />

          <div class="flex gap-2">
            <Button variant="outline" @click="bukaWhatsApp">
              Buka WhatsApp
            </Button>
            <Button @click="salinPesan">
              Salin Pesan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="emit('close')">Batal</Button>
        <Button @click="langkah = 'form'">Pelanggan sudah dihubungi — Lanjutkan</Button>
      </div>
    </template>

    <template v-else>
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Konfirmasi & Jadwalkan</CardTitle>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" novalidate @submit="onSubmit">
            <div class="space-y-2">
              <Label>Keputusan</Label>
              <Select v-model="status" v-bind="statusAttrs">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih keputusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DITERIMA">Terima & Jadwalkan</SelectItem>
                  <SelectItem value="PERLU_REVISI">Minta Revisi</SelectItem>
                  <SelectItem value="DITOLAK">Tolak</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.status" class="text-xs text-destructive">{{ errors.status }}</p>
            </div>

            <template v-if="butuhJadwal">
              <Separator />

              <div v-if="permohonan.tipe_paket === 'custom' && permohonan.jenis_permohonan !== 'relokasi'"
                class="space-y-2 mt-4 mb-4">
                <Label for="harga_custom">Harga Kesepakatan (Rp/Bulan)</Label>
                <Input id="harga_custom" type="number" v-model="hargaCustom" v-bind="hargaCustomAttrs"
                  placeholder="Mis: 350000" :aria-invalid="!!errors.harga_custom" />
                <p v-if="errors.harga_custom" class="text-xs text-destructive">{{ errors.harga_custom }}</p>
                <p class="text-xs text-muted-foreground">Harga ini akan digunakan sebagai tagihan bulanan pelanggan.</p>
              </div>

              <div class="space-y-2">
                <Label>Pilih Tim <span class="text-muted-foreground">(opsional, isi cepat)</span></Label>
                <Select :model-value="timTeknisiId" v-bind="timTeknisiIdAttrs"
                  @update:model-value="(v) => pilihTim(v as string)">
                  <SelectTrigger>
                    <SelectValue placeholder="Atau assign manual di bawah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="t in daftarTim ?? []" :key="t.id" :value="String(t.id)">
                      {{ t.nama_tim }} ({{ (t.anggota ?? []).length }} orang)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div ref="teknisiDropdownRef" class="space-y-2">
                <Label>Teknisi Ditugaskan</Label>

                <div class="relative">
                  <button
                    type="button"
                    class="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    :aria-expanded="teknisiDropdownOpen"
                    aria-haspopup="listbox"
                    @click="bukaDropdownTeknisi"
                  >
                    <span
                      v-if="teknisiTerpilih.length === 0"
                      class="text-muted-foreground"
                    >
                      Pilih teknisi...
                    </span>

                    <div
                      v-else
                      class="min-w-0 flex-1 max-h-[68px] overflow-y-auto pr-1"
                    >
                      <div class="flex flex-wrap items-center gap-1.5">
                        <span
                          v-for="teknisi in teknisiTerpilih"
                          :key="teknisi.id"
                          class="inline-flex max-w-[180px] items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium"
                        >
                          <span class="truncate">
                            {{ teknisi.nama_lengkap }}
                          </span>

                          <span
                            role="button"
                            tabindex="0"
                            class="cursor-pointer text-muted-foreground hover:text-foreground"
                            @click.stop="hapusTeknisi(teknisi.id)"
                            @keydown.enter.stop="hapusTeknisi(teknisi.id)"
                          >
                            ×
                          </span>
                        </span>
                      </div>
                    </div>
                    <span class="ml-2 shrink-0 text-muted-foreground">⌄</span>
                  </button>

                  <div
                    v-if="teknisiDropdownOpen"
                    class="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
                  >
                    <div class="border-b p-2">
                      <Input
                        v-model="teknisiSearch"
                        placeholder="Cari nama teknisi..."
                        autocomplete="off"
                        @keydown.esc="tutupDropdownTeknisi"
                      />
                    </div>

                    <div class="max-h-56 overflow-y-auto p-1">
                      <button
                        v-for="teknisi in teknisiTerfilter"
                        :key="teknisi.id"
                        type="button"
                        role="option"
                        :aria-selected="teknisiTerpilihCheck(teknisi.id)"
                        class="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        @click="toggleTeknisi(teknisi.id)"
                      >
                        <span
                          class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px]"
                          :class="
                            teknisiTerpilihCheck(teknisi.id)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-input bg-background'
                          "
                        >
                          {{ teknisiTerpilihCheck(teknisi.id) ? '✓' : '' }}
                        </span>
                        <span class="truncate">{{ teknisi.nama_lengkap }}</span>
                      </button>

                      <div
                        v-if="teknisiTerfilter.length === 0"
                        class="px-2 py-6 text-center text-sm text-muted-foreground"
                      >
                        Teknisi tidak ditemukan.
                      </div>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-muted-foreground">
                  Pilih satu atau beberapa teknisi. Gunakan pencarian untuk menemukan teknisi dengan cepat.
                </p>
                <p v-if="errors.teknisi_ids" class="text-xs text-destructive">{{ errors.teknisi_ids }}</p>
              </div>

              <div class="space-y-2">
                <Label for="tanggal_kerja">Tanggal Kunjungan</Label>
                <Input id="tanggal_kerja" v-model="tanggalKerja" v-bind="tanggalKerjaAttrs" type="date"
                  :aria-invalid="!!errors.tanggal_kerja" />
                <p v-if="errors.tanggal_kerja" class="text-xs text-destructive">{{ errors.tanggal_kerja }}</p>
              </div>
            </template>

            <div v-if="!butuhJadwal" class="space-y-2">
              <Label for="catatan">Catatan</Label>
              <Textarea id="catatan" v-model="catatan" v-bind="catatanAttrs"
                placeholder="Wajib diisi untuk Tolak / Perlu Revisi" />
              <p v-if="errors.catatan" class="text-xs text-destructive">{{ errors.catatan }}</p>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="langkah = 'wa'">Kembali</Button>
              <Button type="submit" :disabled="isPending">
                {{ isPending ? 'Menyimpan...' : 'Simpan' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
