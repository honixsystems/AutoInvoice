<template>
  <div class="print-wrapper">
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

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { getFacture } = useFactures()
const facture = ref<Facture | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    facture.value = await getFacture(id)
    // Attendre que le contenu soit chargé avant d'imprimer
    setTimeout(() => {
      window.print()
      
      // Écouter l'événement afterprint pour quitter la page une fois l'impression terminée
      window.addEventListener('afterprint', () => {
        router.back()
      }, { once: true })
    }, 1000) // Augmenté à 1000ms pour s'assurer que tout est bien chargé
  }
})
</script>

<style scoped>
.print-wrapper {
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