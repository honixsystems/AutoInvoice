<template>
  <div class="space-y-8">
    <!-- Paramètres de base -->
    <div class="space-y-6">
      <div class="flex flex-col">
        <h3 class="text-lg font-semibold text-gray-900">Paramètres de base</h3>
        <p class="text-sm text-gray-500">Configurez les paramètres généraux du transport</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Prix au kilomètre (€)" name="pricePerKm">
          <UInput 
            v-model="transportSettings.pricePerKm" 
            type="number" 
            min="0" 
            step="0.01" 
            class="w-full" 
          />
        </UFormField>

        <UFormField label="Mention par défaut" name="defaultMention" class="md:col-span-2">
          <UTextarea 
            v-model="transportSettings.defaultMention" 
            placeholder="Transport de véhicule..."
            class="w-full" 
          />
        </UFormField>
      </div>
    </div>

    <!-- Paramètres TVA -->
    <VATSettings v-model="transportSettings.vat" />
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import type { TransportSettings } from '~/types/settings'
import VATSettings from '~/components/VATSettings.vue'
import { useSettings } from '~/composables/useSettings'

const emit = defineEmits<{
  saving: [boolean]
}>()

const { appSettings } = useSettings()

// Paramètres de transport
const transportSettings = computed<TransportSettings>({
  get: () => appSettings.value?.transportSettings || {
    pricePerKm: 0,
    defaultMention: '',
    vat: {
      vatRate: 20,
      displayVAT: true
    }
  },
  set: (value) => {
    if (!appSettings.value) return
    appSettings.value.transportSettings = value
  }
})

// Watcher pour gérer l'état de sauvegarde
watch(transportSettings, (newSettings) => {
  if (newSettings) {
    emit('saving', true)
    setTimeout(() => {
      emit('saving', false)
    }, 1000)
  }
}, { deep: true })
</script>