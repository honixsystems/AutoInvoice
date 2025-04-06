<script setup lang="ts">
import type { Facture, FactureVente, FactureTransport } from '~/composables/useFactures'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { save } from '@tauri-apps/plugin-dialog'
import { generateFacturePath } from '~/utils/path'

interface RouteParams {
    id: string
}

const route = useRoute() as RouteLocationNormalizedLoaded & { params: RouteParams }
const router = useRouter()

const factures = useFactures()
const facture = ref<Facture | null>(null)

onMounted(async () => {
    const factureData = await factures.getFacture(route.params.id)
    if (factureData) {
        facture.value = factureData
    }
})

const isEditing = ref(false)
const isPreviewing = ref(false)

const handleSave = async () => {
    if (!facture.value) return
    await factures.updateFacture(facture.value.id, facture.value)
    isEditing.value = false
}

const handleEdit = () => {
    isEditing.value = true
}

const handlePrint = () => {
    isPreviewing.value = true
}

const handleDownload = async () => {
    try {
        if (!facture.value) {
            throw new Error('Facture non trouvée')
        }
        
        const path = generateFacturePath(facture.value)
        const filePath = await save({
            filters: [{
                name: 'PDF',
                extensions: ['pdf']
            }],
            defaultPath: path
        })
        
        if (filePath) {
            console.warn('La génération de PDF n\'est pas encore implémentée')
        }
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error)
    }
}

const getFactureMontant = (facture: Facture) => {
    if (facture.type === 'vente') {
        return (facture as FactureVente).vehicle_price
    } else {
        const transport = facture as FactureTransport
        return (transport.distance * transport.price_per_km) + transport.pickup_price
    }
}
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <div class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold text-gray-900">Facture de {{ facture?.type === 'vente' ? 'vente' :
                    'transport' }}</h1>
                <p class="text-gray-500 text-sm">
                    Identifiant: <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{ facture?.id }}</span>
                </p>
            </div>
            <div class="flex space-x-4">
                <UButton color="primary" icon="i-heroicons-arrow-left" @click="router.back()">
                    Retour
                </UButton>
                <UButton color="neutral" variant="ghost" icon="i-heroicons-pencil-square" @click="handleEdit">
                    Modifier
                </UButton>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="flex flex-col space-y-6">
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold mb-4 h-[32px]">Client</h3>
                    <UserCardCompact v-if="facture?.client_id" :client-id="facture.client_id" />
                </div>
                <div class="flex flex-col">
                    <div class="flex flex-row justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Prévisualisation de la facture</h3>
                        <ULink :to="`/settings`" color="neutral" variant="ghost">
                            Modifier le style
                        </ULink>
                    </div>
                    <FacturePreview v-if="facture" :facture="facture" />
                </div>
            </div>
            <div class="flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Détails de la facture</h3>
                    <div class="flex space-x-2">
                        <UButton color="neutral" variant="ghost" icon="i-heroicons-document-arrow-down" @click="handleDownload">
                            Enregistrer en PDF
                        </UButton>
                        <UButton color="neutral" variant="ghost" icon="i-heroicons-printer" @click="handlePrint">
                            Imprimer
                        </UButton>
                    </div>
                </div>
                <FactureVenteDetails v-if="facture?.type === 'vente'" :facture-id="facture.id" />
                <FactureTransportDetails v-if="facture?.type === 'transport'" :facture-id="facture.id" />
            </div>
        </div>

        <FacturePreviewModal v-if="isPreviewing && facture" :facture-id="facture.id" v-model="isPreviewing" />
    </div>
</template>
