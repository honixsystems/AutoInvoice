<template>
  <div class="invoice-container">
    <div v-for="(page, index) in pages" :key="index" class="invoice-template" ref="templateRefs">
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

      <!-- Informations client (uniquement sur la première page) -->
      <div v-if="index === 0" class="client-info">
        <slot name="client-info">
          <h3>Client</h3>
          <div class="client-details">
            <slot name="client-details"></slot>
          </div>
        </slot>
      </div>

      <!-- Contenu principal -->
      <div class="main-content" :ref="el => setContentRef(el, index)">
        <slot name="main-content"></slot>
      </div>

      <!-- Pied de page -->
      <div class="footer">
        <slot name="footer">
          <p v-html="formattedFooter"></p>
        </slot>
        <div class="page-number" v-if="pages.length > 1">
          Page {{ index + 1 }} sur {{ pages.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { Store } from '@tauri-apps/plugin-store'

const props = defineProps({
  settings: {
    type: Object,
    default: () => null
  }
})

const settings = ref(null)
const { $generatePdfFromElement } = useNuxtApp()
const templateRefs = ref([])
const contentRefs = ref([])
const pages = ref([0]) // Commence avec une page

const formattedFooter = computed(() => {
  return settings.value?.footerNote?.replace(/\n/g, '<br>') || ''
})

// Fonction pour définir la référence du contenu
const setContentRef = (el, index) => {
  if (el) {
    contentRefs.value[index] = el
  }
}

// Fonction pour vérifier si le contenu dépasse la hauteur de la page
const checkContentOverflow = async () => {
  await nextTick()
  
  const pageHeight = 1123 // Hauteur A4 en pixels
  const headerHeight = 150 // Hauteur approximative de l'en-tête
  const footerHeight = 100 // Hauteur approximative du pied de page
  const availableHeight = pageHeight - headerHeight - footerHeight
  
  let currentPage = 0
  const newPages = [0]
  
  for (let i = 0; i < contentRefs.value.length; i++) {
    const content = contentRefs.value[i]
    if (content) {
      const contentHeight = content.scrollHeight
      
      if (contentHeight > availableHeight) {
        // Le contenu dépasse, créer une nouvelle page
        currentPage++
        newPages.push(currentPage)
      }
    }
  }
  
  pages.value = newPages
}

// Observer les changements de contenu
const observeContent = () => {
  const observer = new ResizeObserver(() => {
    checkContentOverflow()
  })
  
  contentRefs.value.forEach(ref => {
    if (ref) {
      observer.observe(ref)
    }
  })
  
  return observer
}

onMounted(async () => {
  try {
    const store = await Store.load('company-settings.json')
    const savedSettings = await store.get('settings')
    if (savedSettings) {
      settings.value = savedSettings
    }
    
    // Initialiser l'observation du contenu
    const observer = observeContent()
    
    // Vérifier le dépassement initial
    await checkContentOverflow()
    
    // Nettoyer l'observer lors du démontage
    onUnmounted(() => {
      observer.disconnect()
    })
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})

defineExpose({
  generatePdf: async (path) => {
    const elements = document.querySelectorAll('.invoice-template')
    if (elements.length > 0) {
      await $generatePdfFromElement(elements, path)
    }
  }
})
</script>

<style scoped>
.invoice-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invoice-template {
  width: 794px; /* Largeur A4 en pixels (210mm) */
  height: 1123px; /* Hauteur A4 en pixels (297mm) */
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #2c3e50;
  position: relative;
  transform-origin: top left;
  will-change: transform;
  page-break-after: always;
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
  min-height: 200px;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
  text-align: center;
  position: absolute;
  bottom: 40px;
  left: 40px;
  right: 40px;
}

.page-number {
  margin-top: 10px;
  font-size: 0.8em;
  color: #999;
}

/* Styles pour l'impression */
@media print {
  .invoice-container {
    gap: 0;
  }

  .invoice-template {
    box-shadow: none;
    page-break-after: always;
  }
}
</style> 