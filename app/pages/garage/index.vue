<script lang="ts" setup>
const router = useRouter()

console.log('garage')

const backHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Nouvelle facture garage</h1>
      <UButton @click="backHome">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Retour à l'accueil
      </UButton>
    </div>
    <GarageForm />
  </div>
</template>
