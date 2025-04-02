<script setup lang="ts">
import { useFactures, type FactureTransport } from '~/composables/useFactures'

const route = useRoute()
const router = useRouter()
const { getFacture, updateFacture } = useFactures()

const facture = ref<FactureTransport | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const id = route.params.id as string
    const factureData = await getFacture(id)
    
    if (!factureData || factureData.type !== 'transport') {
      error.value = 'Facture non trouvée'
      return
    }
    
    facture.value = factureData
  } catch (e) {
    error.value = 'Erreur lors du chargement de la facture'
    console.error('Erreur lors du chargement de la facture:', e)
  } finally {
    isLoading.value = false
  }
})

const handleSubmit = async (data: FactureTransport) => {
  try {
    await updateFacture(route.params.id as string, data)
    router.push('/historique')
  } catch (e) {
    error.value = 'Erreur lors de la mise à jour de la facture'
    console.error('Erreur lors de la mise à jour de la facture:', e)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Éditer la facture de transport</h1>
      <UButton
        color="primary"
        to="/historique"
        icon="i-heroicons-arrow-left"
      >
        Retour
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Modifier la facture</h2>
        </div>
      </template>

      <div v-if="error" class="mb-4">
        <UAlert
          color="error"
          :title="error"
        />
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
      </div>

      <TransportForm
        v-else-if="facture"
        :facture-id="facture.id"
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template> 