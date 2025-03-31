<template>
  <div class="invoice-template">
    <div class="header">
      <div class="header-left">
        <img src="/images/logo.png" alt="Logo Olivautos" class="logo">
        <h1>FACTURE DE TRANSPORT</h1>
      </div>
      <div class="header-right">
        <div class="company-info">
          <h2>Olivautos</h2>
          <p>Rue de la Royale Harmonie, 23</p>
          <p>1420 Braine-l'Alleud</p>
          <p>Tél: 0472 54 15 00</p>
        </div>
      </div>
    </div>

    <div class="client-info">
      <h3>Client</h3>
      <p>{{ data.clientName }}</p>
      <p v-if="data.clientPhone">Tél: {{ data.clientPhone }}</p>
      <p v-if="data.clientEmail">Email: {{ data.clientEmail }}</p>
      <p v-if="data.clientAddress" v-html="formattedAddress"></p>
      <p v-if="data.clientVAT">TVA: {{ data.clientVAT }}</p>
    </div>

    <div class="transport-details">
      <h3>Détails du transport</h3>
      <p>Date: {{ data.transportDate }}</p>
      <p>Départ: {{ data.departureLocation }}</p>
      <p>Arrivée: {{ data.arrivalLocation }}</p>
    </div>

    <div class="pricing">
      <h3>Tarifs</h3>
      <table>
        <tr>
          <td>Distance</td>
          <td>{{ data.distance }} km</td>
          <td>{{ data.pricePerKm }} €/km</td>
          <td>{{ (data.distance * data.pricePerKm).toFixed(2) }} €</td>
        </tr>
        <tr v-if="data.pickupPrice > 0">
          <td>Prise en charge</td>
          <td>-</td>
          <td>-</td>
          <td>{{ data.pickupPrice.toFixed(2) }} €</td>
        </tr>
      </table>
      <div class="total">
        <strong>Total HT: {{ total }} €</strong>
      </div>
      <div v-if="data.additionalNotes && data.additionalNotes.trim()" class="additional-notes">
        <h3>Mentions supplémentaires</h3>
        <p v-html="formattedNotes"></p>
      </div>
    </div>

    <div class="footer">
      <p>Conditions de paiement par virement bancaire</p>
      <p>Numéro de compte: BE00 0000 0000 0000</p>
      <p>Pour toute question, veuillez nous contacter au 0472 54 15 00</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const props = defineProps<{
  data: TransportData
}>()

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
.invoice-template {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #2c3e50;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #EC6714;
}

.header-left {
  text-align: left;
}

.header-right {
  text-align: right;
}

.logo {
  max-width: 180px;
  margin-bottom: 10px;
}

h1 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
  font-weight: 600;
}

.company-info h2 {
  color: #EC6714;
  font-size: 24px;
  margin: 0 0 10px 0;
}

.company-info p {
  margin: 3px 0;
  color: #666;
  line-height: 1.3;
}

.client-info, .transport-details {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

h3 {
  color: #EC6714;
  font-size: 18px;
  margin: 0 0 15px 0;
  font-weight: 600;
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
  border-left: 4px solid #EC6714;
}

.additional-notes {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #EC6714;
}

.additional-notes p {
  margin: 3px 0;
  color: #666;
  line-height: 1.3;
  white-space: pre-wrap;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
  text-align: center;
}
</style> 