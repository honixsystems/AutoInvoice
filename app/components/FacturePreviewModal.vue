<template>
  <UModal 
    :open="isOpen" 
    fullscreen
    @update:open="(value) => emit('update:modelValue', value)"
    title="Prévisualisation de la facture" 
    description="Prévisualisation de la facture" 
    icon="i-heroicons-eye"
  >
    <template #content>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">Prévisualisation de la facture</h3>
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        </div>
        <div v-else-if="error" class="text-red-500 text-center">
          {{ error }}
        </div>
        <FacturePreview v-else-if="facture" :facture="facture" />
        <div class="flex justify-end mt-4 space-x-2">
          <UButton color="neutral" @click="$emit('update:modelValue', false)">Fermer</UButton>
          <UButton color="primary" @click="handlePrint">Imprimer</UButton>
          <!--
          <UButton color="primary" @click="handleDownload">Enregistrer en PDF</UButton>
          -->
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import { useFactures, type Facture } from '~/composables/useFactures'
import { generateFacturePath } from '~/utils/path'

const props = defineProps<{
  modelValue: boolean,
  factureId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

const { getFacture } = useFactures()
const facture = ref<Facture | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadFacture = async () => {
  if (!props.factureId) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const data = await getFacture(props.factureId)
    if (!data) {
      error.value = 'Facture non trouvée'
      return
    }
    facture.value = data
  } catch (e) {
    console.error('Erreur lors du chargement de la facture:', e)
    error.value = 'Erreur lors du chargement de la facture'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (props.factureId) {
    loadFacture()
  }
})

watch(() => props.factureId, (newId) => {
  if (newId) {
    loadFacture()
  }
})

const handlePrint = () => {
  if (facture.value) {
    const url = `/print/${facture.value.id}`
    navigateTo(url)
  }
}

const handleDownload = async () => {
  try {
    if (!facture.value) {
      throw new Error('Facture non trouvée')
    }
    
    const path = generateFacturePath(facture.value)
    const filePath = await save({
      filters: [{
        name: 'PDF',
        extensions: ['pdf']
      }],
      defaultPath: path
    })
    
    if (filePath) {
      const url = `/pdf/${facture.value.id}?path=${encodeURIComponent(filePath)}`
      navigateTo(url)
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
  }
}
</script>
