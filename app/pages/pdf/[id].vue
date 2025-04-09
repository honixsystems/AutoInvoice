<template>
  <div class="pdf-wrapper">
    <VenteInvoiceTemplate v-if="facture?.type === 'vente'" :facture-id="facture.id" />
    <TransportInvoiceTemplate v-else-if="facture?.type === 'transport'" :facture-id="facture.id" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFactures } from '~/composables/useFactures'
import VenteInvoiceTemplate from '~/components/VenteInvoiceTemplate.vue'
import TransportInvoiceTemplate from '~/components/TransportInvoiceTemplate.vue'
import type { Facture } from '~/composables/useFactures'
import { writeFile } from '@tauri-apps/plugin-fs'
import html2pdf from 'html2pdf.js';
definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { getFacture } = useFactures()
const facture = ref<Facture | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  const path = route.query.path as string
  
  if (id && path) {
    facture.value = await getFacture(id)
    
    // Attendre que le contenu soit chargé avant de générer le PDF
    setTimeout(async () => {
      try {
        const element = document.querySelector('.pdf-wrapper')
        if (element) {
          const blob = await html2pdf().from(element).output('blob')
          await writeFile(path, blob)
        }
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error)
      } finally {
        // Retourner à la page précédente
        router.back()
      }
    }, 1000) // Attendre 1 seconde pour s'assurer que tout est bien chargé
  }
})
</script>

<style scoped>
.pdf-wrapper {
  width: 100%;
  height: 100%;
}

@media print {
  body {
    background: white !important;
    color: black;
  }

  html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
</style> 