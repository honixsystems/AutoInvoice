<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8">
    <div class="max-w-4xl w-full text-center">
      <div class="relative mb-12">
        <UIcon 
          :name="error.statusCode === 404 ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-exclamation-circle'" 
          class="w-24 h-24" 
          :class="error.statusCode === 404 ? 'text-warning-500' : 'text-error-500'" 
        />
      </div>

      <h1 class="text-4xl font-bold text-gray-900 mb-6">
        {{ error.statusCode === 404 ? 'Page non trouvée' : 'Une erreur est survenue' }}
      </h1>
      
      <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        {{ error.statusCode === 404 
          ? 'La page que vous recherchez n\'existe pas ou est en cours de développement.' 
          : 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.' 
        }}
      </p>

      <div class="flex flex-col items-center gap-6">
        <UButton
          size="xl"
          color="primary"
          class="w-full max-w-md flex justify-center items-center"
          to="/"
        >
          Retour à l'accueil
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()
</script>
