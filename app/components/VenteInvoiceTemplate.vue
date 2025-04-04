<template>
  <BaseInvoiceTemplate>
    <template #title>
      <h1>FACTURE DE VENTE</h1>
    </template>

    <template #client-details>
      <div class="client-detail-row">
        <span class="label">Nom:</span>
        <span class="value">{{ data?.client?.name }}</span>
      </div>
      <div class="client-detail-row" v-if="data?.client?.phone">
        <span class="label">Téléphone:</span>
        <span class="value">{{ data?.client?.phone }}</span>
      </div>
      <div class="client-detail-row" v-if="data?.client?.email">
        <span class="label">Email:</span>
        <span class="value">{{ data?.client?.email }}</span>
      </div>
      <div class="client-detail-row" v-if="data?.client?.address">
        <span class="label">Adresse:</span>
        <span class="value" v-html="formattedAddress"></span>
      </div>
      <div class="client-detail-row" v-if="data?.client?.vat">
        <span class="label">TVA:</span>
        <span class="value">{{ data?.client?.vat }}</span>
      </div>
    </template>

    <template #main-content>
      <div class="vehicle-info">
        <h3>Véhicule</h3>
        <div class="vehicle-details">
          <div class="vehicle-detail-row">
            <span class="label">Marque/Modèle:</span>
            <span class="value"><strong>{{ data?.vehicle_brand }} {{ data?.vehicle_model }}</strong></span>
          </div>
          <div class="vehicle-detail-row">
            <span class="label">Numéro de châssis:</span>
            <span class="value"><strong>{{ data?.vehicle_chassis }}</strong></span>
          </div>
          <div class="vehicle-detail-row">
            <span class="label">Kilométrage:</span>
            <span class="value"><strong>{{ data?.vehicle_mileage }} km</strong></span>
          </div>
          <div class="vehicle-detail-row">
            <span class="label">Couleur:</span>
            <span class="value"><strong>{{ data?.vehicle_color }}</strong></span>
          </div>
          <div class="vehicle-detail-row">
            <span class="label">Type de véhicule:</span>
            <span class="value"><strong>{{ data?.vehicle_type }}</strong></span>
          </div>
          <div class="vehicle-detail-row">
            <span class="label">Date de première immatriculation:</span>
            <span class="value"><strong>{{ formattedDate }}</strong></span>
          </div>
        </div>
      </div>

      <div class="pricing">
        <h3>Détails de la facture</h3>
        <table>
          <tr>
            <td>Véhicule</td>
            <td>{{ data?.vehicle_brand }} {{ data?.vehicle_model }}</td>
            <td>{{ (data?.vehicle_price || 0).toFixed(2) }} €</td>
          </tr>
        </table>
        <div class="total">
          <p v-if="(data?.deposit || 0) > 0" class="deposit-info">Acompte reçu : {{ (data?.deposit || 0).toFixed(2) }} €</p>
          <div class="price-details">
            <div class="price-row" v-if="settings?.displayVAT">
              <span class="label">Montant HT:</span>
              <span class="value">{{ priceDetails.priceHT }}</span>
            </div>
            <div class="price-row" v-if="settings?.displayVAT">
              <span class="label">TVA ({{ settings?.vatRate || 21 }}%):</span>
              <span class="value">{{ priceDetails.tva }}</span>
            </div>
            <div class="price-row total-row">
              <span class="label"><strong>Total TTC:</strong></span>
              <span class="value">{{ priceDetails.total }} €</span>
            </div>
          </div>
        </div>
        <div v-if="data?.additional_notes && data?.additional_notes.trim()" class="additional-notes">
          <h3>Mentions supplémentaires</h3>
          <p v-html="formattedNotes"></p>
        </div>
      </div>
    </template>
  </BaseInvoiceTemplate>
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
.vehicle-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vehicle-detail-row {
  display: grid;
  grid-template-columns: 250px 1fr;
  align-items: center;
  gap: 16px;
}

.vehicle-detail-row .label {
  color: #666;
  font-weight: 500;
}

.vehicle-detail-row .value {
  color: #2c3e50;
}

.client-detail-row {
  display: grid;
  grid-template-columns: 250px 1fr;
  align-items: start;
  gap: 16px;
}

.client-detail-row .label {
  color: #666;
  font-weight: 500;
}

.client-detail-row .value {
  color: #2c3e50;
}

.pricing {
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
}

td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

td:last-child {
  text-align: right;
  font-weight: 500;
}

.deposit-info {
  margin-bottom: 10px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.7em;
}

.total {
  text-align: right;
  margin-top: 20px;
  font-size: 1.3em;
  color: #2c3e50;
  font-weight: 600;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid v-bind('settings?.primaryColor || "#EC6714"');
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  font-size: 0.7em;
}

.price-row .label {
  color: #666;
  font-weight: 500;
}

.price-row .value {
  color: #2c3e50;
  font-weight: 500;
}

.total-row {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  font-weight: 600;
  font-size: 1.3em;
}

.total-row .label {
  color: #2c3e50;
}

.total-row .value {
  color: v-bind('settings?.primaryColor || "#EC6714"');
}

.additional-notes {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid v-bind('settings?.primaryColor || "#EC6714"');
}

.additional-notes h3 {
  color: v-bind('settings?.primaryColor || "#EC6714"');
  font-size: 18px;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.additional-notes p {
  margin: 3px 0;
  color: #666;
  line-height: 1.3;
  white-space: pre-wrap;
}

h1 {
  color: v-bind('settings?.primaryColor || "#EC6714"');
  font-size: 28px;
  margin: 0;
  font-weight: 600;
}

h3 {
  color: v-bind('settings?.primaryColor || "#EC6714"');
  font-size: 18px;
  margin: 0 0 15px 0;
  font-weight: 600;
}
</style> 