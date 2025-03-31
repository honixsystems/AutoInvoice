<script lang="ts" setup>
const router = useRouter()

console.log('vente')

const backHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="container mx-auto py-4 max-w-4xl">
    <UButton
      color="neutral"
      variant="ghost"
      @click="backHome"
      class="mb-4"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2" />
      Retour à l'accueil
    </UButton>
    <VenteForm />
  </div>
</template>