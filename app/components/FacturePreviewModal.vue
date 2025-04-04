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
        <div v-else class="border rounded-lg p-4 overflow-y-auto max-h-[80vh] invoice-template">
          <VenteInvoiceTemplate v-if="facture?.type === 'vente'" :facture-id="factureId" />
          <TransportInvoiceTemplate v-else-if="facture?.type === 'transport'" :facture-id="factureId" />
        </div>
        <div class="flex justify-end mt-4 space-x-2">
          <UButton color="neutral" @click="$emit('update:modelValue', false)">Fermer</UButton>
          <UButton color="primary" @click="handlePrint">Imprimer</UButton>
          <UButton color="primary" @click="handleDownload">Enregistrer en PDF</UButton>
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
  window.print()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '_')
}

const formatString = (str: string) => {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // Remplace tous les caractères spéciaux et espaces par des underscores
    .replace(/^_+|_+$/g, '') // Enlève les underscores au début et à la fin
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
      const templateRef = ref(null)
      await templateRef.value?.generatePdf(filePath)
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
  }
}
</script>
