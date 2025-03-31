<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <img src="/images/logo.png" class="h-32 m-4" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <UButton
        class="h-48 text-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
        @click="$emit('select-type', 'transport')"
      >
        <div class="flex flex-col items-center">
          <UIcon name="i-heroicons-truck" class="w-16 h-16 mb-4" />
          <span>Facture Transport</span>
        </div>
      </UButton>
      
      <UButton
        class="h-48 text-xl font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
        @click="$emit('select-type', 'vente')"
      >
        <div class="flex flex-col items-center">
          <UIcon name="i-heroicons-credit-card" class="w-16 h-16 mb-4" />
          <span>Facture Vente</span>
        </div>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'select-type', type: 'transport' | 'vente'): void
}>()
</script> 