<script setup lang="ts">
import { useFactures } from '~/composables/useFactures'
import type { FactureVente } from '~/composables/useFactures'

const props = defineProps<{
  factureId: string
}>()

const { getFacture } = useFactures()
const facture = ref<FactureVente | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const factureData = await getFacture(props.factureId)
    if (factureData && factureData.type === 'vente') {
      facture.value = factureData as FactureVente
    } else {
      error.value = 'Facture de vente non trouvée'
    }
  } catch (e) {
    console.error('Erreur lors du chargement de la facture:', e)
    error.value = 'Une erreur est survenue lors du chargement de la facture'
  } finally {
    isLoading.value = false
  }
})
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
      </div>

      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold mb-3">Informations du véhicule</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Marque</p>
            <p class="text-sm font-medium">{{ facture.vehicle_brand }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Modèle</p>
            <p class="text-sm font-medium">{{ facture.vehicle_model }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Numéro de châssis</p>
            <p class="text-sm font-medium">{{ facture.vehicle_chassis }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Kilométrage</p>
            <p class="text-sm font-medium">{{ facture.vehicle_mileage.toLocaleString() }} km</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Type</p>
            <p class="text-sm font-medium">{{ facture.vehicle_type }}</p>
          </div>
          <div v-if="facture.vehicle_color">
            <p class="text-sm text-gray-500">Couleur</p>
            <p class="text-sm font-medium">{{ facture.vehicle_color }}</p>
          </div>
          <div v-if="facture.vehicle_first_registration">
            <p class="text-sm text-gray-500">Première mise en circulation</p>
            <p class="text-sm font-medium">{{ formatDate(facture.vehicle_first_registration) }}</p>
          </div>
        </div>
      </div>

      <div v-if="facture.additional_notes" class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-semibold mb-2">Notes additionnelles</h4>
        <p class="text-sm text-gray-700">{{ facture.additional_notes }}</p>
      </div>

      <div class="border-t border-gray-200 pt-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h5 class="text-sm font-semibold mb-4">Détail du prix</h5>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Prix du véhicule</span>
              <span class="text-lg font-bold text-primary-600">{{ facture.vehicle_price.toFixed(2) }} €</span>
            </div>
            <div v-if="facture.deposit" class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Acompte</span>
              <span class="text-sm font-medium">{{ facture.deposit.toFixed(2) }} €</span>
            </div>
            <div v-if="facture.deposit" class="border-t border-gray-200 pt-3 mt-3">
              <div class="flex justify-between items-center">
                <span class="text-sm font-semibold">Reste à payer</span>
                <span class="text-lg font-bold text-primary-500">{{ (facture.vehicle_price).toFixed(2) }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template> 