<template>
  <UCard class="p-0 invoice-preview max-h-[70vh] overflow-auto flex justify-center items-start" :ui="{ body: 'p-0 sm:p-0 w-full' }">
    <div v-if="isLoading" class="w-full h-[70vh] flex items-center justify-center">
      <UProgress
        animation="carousel"
        :value="100"
        indeterminate
        class="w-32"
      />
    </div>
    <div v-else-if="pdfUrl" class="w-full h-full">
      <iframe :src="pdfUrl" class="w-full h-[70vh]" frameborder="0"></iframe>
    </div>
    <div v-else class="w-full h-full flex items-center justify-center">
      <UAlert v-if="errorMessage" color="error" :title="errorMessage" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Facture } from '~/types/facture/common'
import { useTypst } from '~/composables/useTypst'
import { ref, onMounted, watch } from 'vue'
import { useSettings } from '~/composables/useSettings'

const props = defineProps<{
  facture: Facture
}>()

const pdfUrl = ref<string | null>(null)
const isLoading = ref(true)
const { generatePdf } = useTypst()
const { companySettings, loadSettings } = useSettings()
const errorMessage = ref<string | null>(null)

const generatePreview = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null
    
    if (!companySettings.value) {
      await loadSettings()
      if (!companySettings.value) {
        throw new Error('Paramètres de l\'entreprise non trouvés')
      }
    }
    
    const typstData = props.facture.toTypst(companySettings.value)
    const pdfData = await generatePdf(props.facture.type, typstData)
    const blob = new Blob([new Uint8Array(pdfData)], { type: 'application/pdf' })
    pdfUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    errorMessage.value = 'Erreur lors de la génération du PDF'
  } finally {
    isLoading.value = false
  }
}

// Générer la prévisualisation au montage du composant
onMounted(() => {
  generatePreview()
})

// Regénérer la prévisualisation si la facture change
watch(() => props.facture, () => {
  generatePreview()
}, { deep: true })
</script>