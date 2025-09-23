<template>
  <div class="space-y-8">
    <!-- Paramètres de base -->
    <div class="space-y-6">
      <div class="flex flex-col">
        <h3 class="text-lg font-semibold text-gray-900">Paramètres de base</h3>
        <p class="text-sm text-gray-500">Configurez les paramètres généraux de la vente</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Mention par défaut" name="defaultMention" class="md:col-span-2">
          <UTextarea 
            v-model="venteSettings.defaultMention" 
            placeholder="Vente de véhicule..."
            class="w-full" 
          />
        </UFormField>
      </div>
    </div>

    <!-- Paramètres TVA -->
    <VATSettings v-model="venteSettings.vat" />
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import type { VenteSettings } from '~/types/settings'
import VATSettings from '~/components/VATSettings.vue'
import { useSettings } from '~/composables/useSettings'

const emit = defineEmits<{
  saving: [boolean]
}>()

const { appSettings } = useSettings()

// Paramètres de vente
const venteSettings = computed<VenteSettings>({
  get: () => appSettings.value?.venteSettings || {
    defaultMention: '',
    vat: {
      vatRate: 20,
      displayVAT: true
    }
  },
  set: (value) => {
    if (!appSettings.value) return
    appSettings.value.venteSettings = value
  }
})

// Watcher pour gérer l'état de sauvegarde
watch(venteSettings, (newSettings) => {
  if (newSettings) {
    emit('saving', true)
    setTimeout(() => {
      emit('saving', false)
    }, 1000)
  }
}, { deep: true })
</script>