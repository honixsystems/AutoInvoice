<script setup lang="ts">
import { ref, watch } from 'vue'
import { writeFile } from '@tauri-apps/plugin-fs'
import { BaseDirectory } from '@tauri-apps/plugin-fs'

const props = defineProps<{
  initialLogoData?: Uint8Array
}>()

const emit = defineEmits<{
  'update:logoData': [Uint8Array]
}>()

const logoPreview = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const isHovered = ref(false)
const isDragging = ref(false)

const updateLogoPreview = () => {
  if (props.initialLogoData) {
    const blob = new Blob([props.initialLogoData], { type: 'image/png' })
    logoPreview.value = URL.createObjectURL(blob)
  } else {
    logoPreview.value = null
  }
}

watch(() => props.initialLogoData, () => {
  updateLogoPreview()
}, { immediate: true })

async function handleLogoChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    await processFile(input.files[0])
  }
}

async function processFile(file: File) {
  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
  
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  emit('update:logoData', uint8Array)
  
  await writeFile('logo.png', uint8Array, { baseDir: BaseDirectory.AppLocalData })
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0])
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}
</script>

<template>
  <div 
    class="relative aspect-square w-full"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="$refs.fileInput?.click()"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div 
      class="absolute inset-0 flex flex-col items-center justify-center rounded-lg transition-all duration-200"
      :class="[
        isDragging ? 'bg-primary-50 border-2 border-dashed border-primary-500' : 'bg-gray-50/50',
        logoPreview ? 'group cursor-pointer' : 'cursor-pointer'
      ]"
    >
      <img 
        v-if="logoPreview" 
        :src="logoPreview" 
        alt="Logo actuel" 
        class="absolute inset-0 w-full h-full object-contain rounded-lg transition-all duration-200 p-2"
        :class="{ 'opacity-75 blur-sm': isHovered || isDragging }"
      />
      
      <div 
        v-if="!logoPreview || isHovered || isDragging"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center rounded-lg transition-all duration-200"
        :class="[
          logoPreview ? 'bg-black/20 backdrop-blur-sm' : '',
          isHovered && !isDragging ? 'bg-gray-100/50' : ''
        ]"
      >
        <UIcon 
          :name="isDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-photo'" 
          class="w-8 h-8 transition-transform duration-200"
          :class="[
            logoPreview && !isHovered ? 'text-white' : 'text-gray-900',
            isHovered ? 'scale-110' : ''
          ]"
        />
        <div class="text-sm" :class="logoPreview && !isHovered ? 'text-white' : 'text-gray-900'">
          <p v-if="isDragging">Déposer le logo ici</p>
          <p v-else>Cliquez ou glissez-déposez un logo</p>
          <p class="text-xs mt-1">PNG, JPG (max. 2MB)</p>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleLogoChange"
    />
  </div>
</template> 