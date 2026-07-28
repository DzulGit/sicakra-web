<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { ImagePlus, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: File | null
  label: string
  hint?: string
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', file: File | null | undefined): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const isImageOpen = ref(false)

watch(() => props.modelValue, (newFile) => {
  if (newFile) {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(newFile)
  } else {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
    if (inputRef.value) inputRef.value.value = ''
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function onChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  emit('update:modelValue', file || null)
}

function hapusFoto() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium leading-none text-landing-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {{ label }} <span v-if="hint" class="text-landing-ink/60 font-normal">({{ hint }})</span>
    </label>
    
    <div v-if="previewUrl" class="relative w-fit mt-2">
      <img 
        :src="previewUrl" 
        alt="Preview foto" 
        class="h-32 w-32 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border"
        @click="isImageOpen = true"
      />
      <button
        type="button"
        class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
        aria-label="Hapus foto"
        @click="hapusFoto"
      >
        <X class="size-3.5" />
      </button>
    </div>

    <label
      v-else
      class="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-landing-ink/30 text-sm text-landing-ink/60 hover:bg-landing-ink/5 mt-2 transition-colors"
    >
      <ImagePlus class="size-6" />
      Pilih Foto
      <input
        ref="inputRef"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        class="hidden"
        @change="onChange"
      />
    </label>

    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>

    <Teleport to="body">
      <div 
        v-if="isImageOpen && previewUrl" 
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
        @click="isImageOpen = false"
      >
        <img 
          :src="previewUrl" 
          alt="Preview Foto Full" 
          class="max-h-[90vh] max-w-[90vw] rounded-md object-contain" 
        />
      </div>
    </Teleport>
  </div>
</template>