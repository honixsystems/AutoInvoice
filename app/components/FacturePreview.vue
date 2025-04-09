<template>
  <UCard class="p-0 invoice-preview max-h-[70vh] overflow-auto flex justify-center items-start">
    <div class="border border-neutral-200 rounded-2xl overflow-hidden" style="transform: scale(0.5); transform-origin: top center;">
      <VenteInvoiceTemplate v-if="facture?.type === 'vente'" :facture-id="facture.id" />
      <TransportInvoiceTemplate v-else-if="facture?.type === 'transport'" :facture-id="facture.id" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Facture } from '~/composables/useFactures'

defineProps<{
  facture: Facture
}>()
</script>