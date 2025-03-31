<template>
  <div class="invoice-template">
    <div class="header">
      <div class="header-left">
        <img src="/images/logo.png" alt="Logo Olivautos" class="logo">
        <h1>FACTURE DE VENTE</h1>
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
      <div class="client-details">
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
      </div>
    </div>

    <div class="vehicle-info">
      <h3>Véhicule</h3>
      <div class="vehicle-details">
        <div class="vehicle-detail-row">
          <span class="label">Marque/Modèle:</span>
          <span class="value"><strong>{{ data.vehicleBrand }} {{ data.vehicleModel }}</strong></span>
        </div>
        <div class="vehicle-detail-row">
          <span class="label">Numéro de châssis:</span>
          <span class="value"><strong>{{ data.vehicleChassis }}</strong></span>
        </div>
        <div class="vehicle-detail-row">
          <span class="label">Kilométrage:</span>
          <span class="value"><strong>{{ data.vehicleMileage }} km</strong></span>
        </div>
        <div class="vehicle-detail-row">
          <span class="label">Couleur:</span>
          <span class="value"><strong>{{ data.vehicleColor }}</strong></span>
        </div>
        <div class="vehicle-detail-row">
          <span class="label">Type de véhicule:</span>
          <span class="value"><strong>{{ data.vehicleType }}</strong></span>
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
          <td>{{ data.vehicleBrand }} {{ data.vehicleModel }}</td>
          <td>{{ data.vehiclePrice.toFixed(2) }} €</td>
        </tr>
      </table>
      <div class="total">
        <p v-if="data.deposit > 0" class="deposit-info">Acompte reçu : {{ data.deposit.toFixed(2) }} €</p>
        <div class="price-details">
          <div class="price-row">
            <span class="label">Montant HT:</span>
            <span class="value">{{ priceDetails.priceHT }}</span>
          </div>
          <div class="price-row">
            <span class="label">TVA (21%):</span>
            <span class="value">{{ priceDetails.tva }}</span>
          </div>
          <div class="price-row total-row">
            <span class="label"><strong>Total TTC:</strong></span>
            <span class="value">{{ priceDetails.total }} €</span>
          </div>
        </div>
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
interface VenteData {
  clientName?: string
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  clientVAT?: string
  vehicleBrand?: string
  vehicleModel?: string
  vehicleChassis?: string
  vehicleMileage?: number
  vehicleColor?: string
  vehicleType?: string
  vehicleFirstRegistration?: string
  vehiclePrice?: number
  deposit?: number
  additionalNotes?: string
}

const props = defineProps<{
  data: VenteData
}>()

const formattedNotes = computed(() => {
  return props.data.additionalNotes?.replace(/\n/g, '<br>') || ''
})

const formattedAddress = computed(() => {
  return props.data.clientAddress?.replace(/\n/g, '<br>') || ''
})

const total = computed(() => {
  const price = props.data.vehiclePrice || 0
  return price.toFixed(2)
})

const formattedDate = computed(() => {
  if (!props.data.vehicleFirstRegistration) return ''
  return new Date(props.data.vehicleFirstRegistration).toLocaleDateString('fr-FR')
})

const priceDetails = computed(() => {
  const price = props.data.vehiclePrice || 0
  const deposit = props.data.deposit || 0
  const priceHT = price / 1.21
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

.client-info, .vehicle-info {
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
  border-left: 4px solid #EC6714;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
  text-align: center;
}

.additional-notes {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #EC6714;
}

.additional-notes h3 {
  color: #EC6714;
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

.client-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  color: #EC6714;
}
</style> 