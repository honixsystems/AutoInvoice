<template>
  <div class="space-y-6">
    <div class="flex flex-col">
      <h3 class="text-lg font-semibold text-gray-900">Paramètres TVA</h3>
      <p class="text-sm text-gray-500">Configurez l'affichage et le calcul de la TVA pour ce service</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormField label="Activer la TVA" name="displayVAT" class="md:col-span-2">
        <USwitch v-model="localVat.displayVAT" />
      </UFormField>

      <UFormField 
        v-if="localVat.displayVAT"
        label="Taux de TVA (%)" 
        name="vatRate"
        class="md:col-span-2"
      >
        <UInput 
          v-model="localVat.vatRate" 
          type="number" 
          min="0" 
          max="100" 
          step="0.1" 
          class="w-full" 
        />
      </UFormField>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { VATSettings } from '~/types/settings'

interface Props {
  modelValue: VATSettings
}

interface Emits {
  (e: 'update:modelValue', value: VATSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localVat = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>