<template>
  <div class="invoice-container">
    <div class="invoice-template">
      <!-- En-tête de la facture -->
      <div class="header">
        <div class="header-left">
          <slot name="logo">
            <CompanyLogo />
          </slot>
          <slot name="title">
            <h1>FACTURE</h1>
          </slot>
        </div>
        <div class="header-right">
          <slot name="company-info">
            <CompanyInfo />
          </slot>
        </div>
      </div>

      <!-- Informations client -->
      <div class="client-info">
        <slot name="client-info">
          <h3>Client</h3>
          <div class="client-details">
            <slot name="client-details"></slot>
          </div>
        </slot>
      </div>

      <!-- Contenu principal -->
      <div class="main-content">
        <slot name="main-content"></slot>
      </div>

      <!-- Pied de page -->
      <div class="footer">
        <slot name="footer">
          <p v-html="formattedFooter"></p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Store } from '@tauri-apps/plugin-store'

const props = defineProps({
  settings: {
    type: Object,
    default: () => null
  }
})

const settings = ref(null)
const { $generatePdfFromElement } = useNuxtApp()

const formattedFooter = computed(() => {
  return settings.value?.footerNote?.replace(/\n/g, '<br>') || ''
})

onMounted(async () => {
  try {
    const store = await Store.load('company-settings.json')
    const savedSettings = await store.get('settings')
    if (savedSettings) {
      settings.value = savedSettings
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})

defineExpose({
  generatePdf: async (path) => {
    const element = document.querySelector('.invoice-template')
    if (element) {
      await $generatePdfFromElement(element, path)
    }
  }
})
</script>

<style scoped>
.invoice-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invoice-template {
  width: 210mm; /* Largeur A4 */
  min-height: 297mm; /* Hauteur A4 */
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #2c3e50;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 2px solid v-bind('settings?.primaryColor || "#EC6714"');
}

.header-left {
  text-align: left;
}

.header-right {
  text-align: right;
}

h1 {
  color: #2c3e50;
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

.client-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-content {
  margin-bottom: 30px;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
  text-align: center;
}

/* Styles pour l'impression */
@media print {
  .invoice-container {
    gap: 0;
  }

  .invoice-template {
    box-shadow: none;
  }
}
</style> 