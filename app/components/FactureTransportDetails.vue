<script setup lang="ts">
import { useFactures } from '~/composables/useFactures'
import type { FactureTransport } from '~/types/facture/transport'

const props = defineProps<{
  factureId: string
}>()

const { getFacture } = useFactures()
const facture = ref<FactureTransport | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const factureData = await getFacture(props.factureId)
    if (factureData && factureData.type === 'transport') {
      facture.value = factureData as FactureTransport
    } else {
      error.value = 'Facture de transport non trouvée'
    }
  } catch (e) {
    console.error('Erreur lors du chargement de la facture:', e)
    error.value = 'Une erreur est survenue lors du chargement de la facture'
  } finally {
    isLoading.value = false
  }
})

const calculateTotal = (facture: FactureTransport) => {
  return (facture.distance * facture.price_per_km) + facture.pickup_price
}
</script>

<template>
  <UCard class="p-0">
    <div v-if="isLoading" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
    </div>
    <div v-else-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
    <div v-else-if="facture" class="space-y-6 p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Date de création</p>
          <p class="text-sm font-medium">{{ formatDate(facture.date_creation) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Date de modification</p>
          <p class="text-sm font-medium">{{ formatDate(facture.date_modification) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Date du transport</p>
          <p class="text-sm font-medium">{{ formatDate(facture.transport_date) }}</p>
        </div>
      </div>

      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold mb-3">Détails du transport</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Lieu de départ</p>
            <p class="text-sm font-medium truncate">{{ facture.departure_location }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Lieu d'arrivée</p>
            <p class="text-sm font-medium truncate">{{ facture.arrival_location }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Distance</p>
            <p class="text-sm font-medium">{{ facture.distance.toLocaleString() }} km</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Prix au km</p>
            <p class="text-sm font-medium">{{ facture.price_per_km.toFixed(2) }} €</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Frais de prise en charge</p>
            <p class="text-sm font-medium">{{ facture.pickup_price.toFixed(2) }} €</p>
          </div>
        </div>
      </div>

      <div v-if="facture.additional_notes" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold mb-2">Notes additionnelles</h4>
        <p class="text-sm text-gray-700 break-words" v-html="formatNote(facture.additional_notes)"></p>
      </div>

      <div class="border-t border-gray-200 pt-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h5 class="text-sm font-semibold mb-4">Détail des coûts</h5>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Distance × Prix au km</span>
              <span class="text-sm font-medium">{{ (facture.distance * facture.price_per_km).toFixed(2) }} €</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Frais de prise en charge</span>
              <span class="text-sm font-medium">{{ facture.pickup_price.toFixed(2) }} €</span>
            </div>
            <div class="border-t border-gray-200 pt-3 mt-3">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold">Total</span>
                <span class="text-lg font-bold text-primary-500">{{ calculateTotal(facture).toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template> 