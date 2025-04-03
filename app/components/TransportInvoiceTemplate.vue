<template>
  <BaseInvoiceTemplate>
    <template #title>
      <h1>FACTURE DE TRANSPORT</h1>
    </template>

    <template #client-details>
      <div class="client-detail-row">
        <span class="label">Nom:</span>
        <span class="value">{{ data.clientName }}</span>
      </div>
      <div class="client-detail-row" v-if="data.clientPhone">
        <span class="label">Téléphone:</span>
        <span class="value">{{ data.clientPhone }}</span>
      </div>
      <div class="client-detail-row" v-if="data.clientEmail">
        <span class="label">Email:</span>
        <span class="value">{{ data.clientEmail }}</span>
      </div>
      <div class="client-detail-row" v-if="data.clientAddress">
        <span class="label">Adresse:</span>
        <span class="value" v-html="formattedAddress"></span>
      </div>
      <div class="client-detail-row" v-if="data.clientVAT">
        <span class="label">TVA:</span>
        <span class="value">{{ data.clientVAT }}</span>
      </div>
    </template>

    <template #main-content>
      <div class="transport-details">
        <h3>Détails du transport</h3>
        <div class="transport-info">
          <div class="transport-detail-row">
            <span class="label">Date:</span>
            <span class="value">{{ data.transportDate }}</span>
          </div>
          <div class="transport-detail-row">
            <span class="label">Départ:</span>
            <span class="value">{{ data.departureLocation }}</span>
          </div>
          <div class="transport-detail-row">
            <span class="label">Arrivée:</span>
            <span class="value">{{ data.arrivalLocation }}</span>
          </div>
        </div>
      </div>

      <div class="pricing">
        <h3>Tarifs</h3>
        <table>
          <tr>
            <td>Distance</td>
            <td>{{ data.distance || 0 }} km</td>
            <td>{{ data.pricePerKm || 0 }} €/km</td>
            <td>{{ ((data.distance || 0) * (data.pricePerKm || 0)).toFixed(2) }} €</td>
          </tr>
          <tr v-if="(data.pickupPrice || 0) > 0">
            <td>Prise en charge</td>
            <td>-</td>
            <td>-</td>
            <td>{{ (data.pickupPrice || 0).toFixed(2) }} €</td>
          </tr>
        </table>
        <div class="total">
          <div class="price-details">
            <div class="price-row">
              <span class="label">Total HT:</span>
              <span class="value">{{ total }} €</span>
            </div>
          </div>
        </div>
        <div v-if="data.additionalNotes && data.additionalNotes.trim()" class="additional-notes">
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

interface TransportData {
  clientName?: string
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  clientVAT?: string
  transportDate?: string
  departureLocation?: string
  arrivalLocation?: string
  distance?: number
  pricePerKm?: number
  pickupPrice?: number
  additionalNotes?: string
}

interface CompanySettings {
  companyName: string
  accountNumber: string
  phoneNumber: string
  address: string
  footerNote?: string
  primaryColor: string
  vatRate: number
}

const props = defineProps<{
  data: TransportData
}>()

const settings = ref<CompanySettings | null>(null)

onMounted(async () => {
  try {
    const store = await Store.load('company-settings.json')
    const savedSettings = await store.get('settings') as CompanySettings | null
    if (savedSettings) {
      settings.value = savedSettings
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})

const formattedNotes = computed(() => {
  return props.data.additionalNotes?.replace(/\n/g, '<br>') || ''
})

const formattedAddress = computed(() => {
  return props.data.clientAddress?.replace(/\n/g, '<br>') || ''
})

const total = computed(() => {
  const distance = props.data.distance || 0
  const pricePerKm = props.data.pricePerKm || 0
  const pickupPrice = props.data.pickupPrice || 0
  return ((distance * pricePerKm) + pickupPrice).toFixed(2)
})
</script>

<style scoped>
.transport-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.transport-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transport-detail-row {
  display: grid;
  grid-template-columns: 250px 1fr;
  align-items: center;
  gap: 16px;
}

.transport-detail-row .label {
  color: #666;
  font-weight: 500;
}

.transport-detail-row .value {
  color: #2c3e50;
}

.client-detail-row {
  display: grid;
  grid-template-columns: 250px 1fr;
  align-items: center;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

td:last-child {
  text-align: right;
  font-weight: 500;
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
</style> 