<script setup lang="ts">
const router = useRouter()

const factureTypes = [
  {
    type: 'transport',
    title: 'Facture Transport',
    description: 'Générez une facture pour le transport de véhicules',
    icon: 'i-heroicons-truck',
    color: 'blue'
  },
  {
    type: 'vente',
    title: 'Facture Vente',
    description: 'Générez une facture pour la vente de véhicules',
    icon: 'i-heroicons-credit-card',
    color: 'green'
  }
]

const navigateTo = (type: 'transport' | 'vente') => {
  router.push(`/${type}`)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-end mb-8">
        <UButton
          color="neutral"
          variant="soft"
          to="/settings"
          size="sm"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="mr-2" />
          Paramètres
        </UButton>
      </div>

      <div class="text-center mb-12">
        <div class="flex justify-center mb-4">
          <CompanyLogo />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Gestion des Factures</h1>
        <p class="text-lg text-gray-600">Sélectionnez le type de facture à générer</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <UCard
          v-for="facture in factureTypes"
          :key="facture.type"
          class="cursor-pointer transition-all duration-300 hover:scale-105 p-6 bg-white ring-2 ring-gray-200 hover:ring-primary-500"
          @click="navigateTo(facture.type as 'transport' | 'vente')"
        >
          <div class="flex flex-col items-center text-center">
            <UIcon
              :name="facture.icon"
              class="w-16 h-16 mb-4"
              :class="`text-${facture.color}-500`"
            />
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">{{ facture.title }}</h2>
            <p class="text-gray-600">{{ facture.description }}</p>
          </div>
        </UCard>
      </div>
    </div>

    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2">
      <UButton
        color="neutral"
        variant="soft"
        to="/historique"
        size="sm"
      >
        <UIcon name="i-heroicons-clock" class="mr-2" />
        Historique des factures
      </UButton>
    </div>
  </div>
</template>