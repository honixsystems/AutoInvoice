<template>
  <UCard class="p-0 invoice-preview max-h-[70vh]">
    <div class="preview-container" id="preview-container">
      <div class="pages-container">
        <VenteInvoiceTemplate v-if="facture?.type === 'vente'" :facture-id="facture.id" />
        <TransportInvoiceTemplate v-else-if="facture?.type === 'transport'" :facture-id="facture.id" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Facture } from '~/composables/useFactures'

defineProps<{
  facture: Facture
}>()
</script>

<style scoped>
.preview-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pages-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

:deep(.invoice-template) {
  transform: scale(0.8);
  transform-origin: top center;
  margin-bottom: 40px;
}

@media print {
  .preview-container {
    padding: 0;
    overflow: visible;
  }

  .pages-container {
    gap: 0;
  }

  :deep(.invoice-template) {
    transform: none;
    margin-bottom: 0;
  }
}
</style> 