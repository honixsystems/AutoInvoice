<template>
  <div v-if="isLoading" class="flex justify-center items-center h-64">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
  </div>
  <PdfPaginator v-else title="FACTURE DE VENTE" :factureId="props.factureId">
    <div class="grid grid-cols-2 gap-4 print-grid">
      <!-- Section Client -->
      <div class="col-span-1 p-3 bg-gray-50 rounded-lg border border-gray-100 print-block">
        <h3 class="text-xs font-bold text-primary mb-2 flex items-center gap-2">
          <span class="w-1 h-4 bg-primary rounded-full"></span>
          Client
        </h3>
        <div class="space-y-1">
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Nom:</span>
            <span class="text-xs text-gray-800">{{ data?.client?.name }}</span>
          </div>
          <div v-if="data?.client?.phone" class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Téléphone:</span>
            <span class="text-xs text-gray-800">{{ data?.client?.phone }}</span>
          </div>
          <div v-if="data?.client?.email" class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Email:</span>
            <span class="text-xs text-gray-800">{{ data?.client?.email }}</span>
          </div>
          <div v-if="data?.client?.address" class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Adresse:</span>
            <span class="text-xs text-gray-800" v-html="formattedAddress"></span>
          </div>
          <div v-if="data?.client?.vat" class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">TVA:</span>
            <span class="text-xs text-gray-800">{{ data?.client?.vat }}</span>
          </div>
        </div>
      </div>

      <!-- Section Véhicule -->
      <div class="col-span-1 p-3 bg-gray-50 rounded-lg border border-gray-100 print-block">
        <h3 class="text-xs font-bold text-primary mb-2 flex items-center gap-2">
          <span class="w-1 h-4 bg-primary rounded-full"></span>
          Véhicule
        </h3>
        <div class="space-y-1">
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Marque/Modèle:</span>
            <span class="text-xs text-gray-800 font-bold">{{ data?.vehicle_brand }} {{ data?.vehicle_model }}</span>
          </div>
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">N° Châssis:</span>
            <span class="text-xs text-gray-800 font-bold">{{ data?.vehicle_chassis }}</span>
          </div>
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Kilométrage:</span>
            <span class="text-xs text-gray-800 font-bold">{{ data?.vehicle_mileage }} km</span>
          </div>
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Couleur:</span>
            <span class="text-xs text-gray-800 font-bold">{{ data?.vehicle_color }}</span>
          </div>
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">Type:</span>
            <span class="text-xs text-gray-800 font-bold">{{ data?.vehicle_type }}</span>
          </div>
          <div class="grid grid-cols-[120px_1fr] gap-2">
            <span class="text-xs text-gray-600 font-medium">1ère immat.:</span>
            <span class="text-xs text-gray-800 font-bold">{{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Notes additionnelles -->
      <div v-if="data?.additional_notes && data?.additional_notes.trim()"
        class="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-100 print-block">
        <h3 class="text-xs font-bold text-primary mb-2 flex items-center gap-2">
          <span class="w-1 h-4 bg-primary rounded-full"></span>
          Mentions supplémentaires
        </h3>
        <p class="text-xs text-gray-600 whitespace-pre-wrap" v-html="formattedNotes"></p>
      </div>

      <!-- Section Prix -->
      <div class="col-span-2 mt-16">
        <div class="flex justify-end">
          <div class="w-full max-w-md">
            <p v-if="(data?.deposit || 0) > 0" class="text-sm text-gray-700 mb-3 text-right">
              Acompte reçu : {{ (data?.deposit || 0).toFixed(2) }} €
            </p>
            <div class="space-y-2">
              <div v-if="settings?.displayVAT" class="grid grid-cols-[1fr_auto] gap-4">
                <span class="text-sm text-gray-600">Montant HT:</span>
                <span class="text-sm text-gray-800">{{ priceDetails.priceHT }} €</span>
              </div>
              <div v-if="settings?.displayVAT" class="grid grid-cols-[1fr_auto] gap-4">
                <span class="text-sm text-gray-600">TVA ({{ settings?.vatRate || 21 }}%):</span>
                <span class="text-sm text-gray-800">{{ priceDetails.tva }} €</span>
              </div>
              <div class="grid grid-cols-[1fr_auto] gap-4 font-bold border-t-2 border-gray-200 pt-3 mt-3">
                <span class="text-base text-gray-800">Total TTC:</span>
                <span class="text-lg text-primary font-bold">{{ priceDetails.total }} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PdfPaginator>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Store } from '@tauri-apps/plugin-store'
import { useFactures } from '~/composables/useFactures'
import type { FactureVente } from '~/composables/useFactures'
import type { CompanySettings } from '~/types/settings'

const props = defineProps<{
  factureId: string
}>()

const { getFacture } = useFactures()
const data = ref<FactureVente | null>(null)
const settings = ref<CompanySettings | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    // Charger les paramètres de l'entreprise
    const store = await Store.load('company-settings.json')
    const savedSettings = await store.get('settings') as CompanySettings | null
    if (savedSettings) {
      settings.value = savedSettings
    }

    // Charger les données de la facture
    const facture = await getFacture(props.factureId)
    if (facture && facture.type === 'vente') {
      data.value = facture
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    isLoading.value = false
  }
})

const formattedNotes = computed(() => {
  return data.value?.additional_notes?.replace(/\n/g, '<br>') || ''
})

const formattedAddress = computed(() => {
  return data.value?.client?.address?.replace(/\n/g, '<br>') || ''
})

const formattedDate = computed(() => {
  if (!data.value?.vehicle_first_registration) return ''
  return new Date(data.value.vehicle_first_registration).toLocaleDateString('fr-FR')
})

const priceDetails = computed(() => {
  const price = data.value?.vehicle_price || 0
  const deposit = data.value?.deposit || 0
  const vatRate = settings.value?.vatRate || 21
  const priceHT = price / (1 + vatRate / 100)
  const tva = price - priceHT

  return {
    priceHT: priceHT.toFixed(2),
    tva: tva.toFixed(2),
    total: price.toFixed(2),
    deposit: deposit.toFixed(2)
  }
})
</script>

<style scoped>
.print-grid {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.print-block {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  background-color: rgb(249 250 251) !important;
}

@media print {
  .print-block {
    break-inside: avoid;
  }
}
</style>