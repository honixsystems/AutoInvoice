<script setup lang="ts">
import type { Facture } from '~/types/facture/common'
import type { FactureVente } from '~/types/facture/vente'
import type { FactureTransport } from '~/types/facture/transport'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { save } from '@tauri-apps/plugin-dialog'
import { generateFacturePath } from '~/utils/path'
import { useTypst } from '~/composables/useTypst'
import { useSettings } from '~/composables/useSettings'

interface RouteParams {
    id: string
}

const route = useRoute() as RouteLocationNormalizedLoaded & { params: RouteParams }
const router = useRouter()

const factures = useFactures()
const facture = ref<Facture | null>(null)

const { generateAndSavePdf } = useTypst()
const { companySettings } = useSettings()
const toast = useToast()

onMounted(async () => {
    const factureData = await factures.getFacture(route.params.id)
    if (factureData) {
        facture.value = factureData
    }
})

const isEditing = ref(false)

const handleSave = async () => {
    if (!facture.value) return
    await factures.updateFacture(facture.value.id, facture.value)
    isEditing.value = false
}

const handleBack = () => {
    const previousRoute = router.options.history.state.back
    if (typeof previousRoute === 'string' && (previousRoute.includes('/vente') || previousRoute.includes('/transport'))) {
        router.push('/')
    } else {
        router.back()
    }
}

const handleEdit = () => {
    navigateTo(`/${facture.value?.type === 'vente' ? 'vente' : 'transport'}/${facture.value?.id}`)
}

const handleGeneratePdf = async () => {
    try {
        if (!facture.value || !companySettings.value) {
            throw new Error('Facture ou paramètres de l\'entreprise non trouvés')
        }

        if (facture.value.type === 'vente') {
            const venteFacture = facture.value as FactureVente
            const typstData = venteFacture.toTypst(companySettings.value)
            await generateAndSavePdf(facture.value.type, typstData)
        } else {
            // TODO: Implémenter pour le type transport
            throw new Error('Génération de PDF non implémentée pour les factures de transport')
        }
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error)
        toast.add({
            title: 'Erreur lors de la génération du PDF',
            description: 'Impossible de générer le PDF, merci de contacter le support',
            color: 'error'
        })
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

const showDeleteModal = ref(false)

const handleDelete = async () => {
    if (!facture.value) return
    showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
    if (!facture.value) return
    await factures.deleteFacture(facture.value.id)
    showDeleteModal.value = false
    handleBack()
}

const handleCancelOrRestore = async () => {
    if (!facture.value) return
    if (facture.value.cancelled === 1) {
        await factures.unCancelFacture(facture.value.id)
        facture.value.cancelled = 0
    } else {
        await factures.cancelFacture(facture.value.id)
        facture.value.cancelled = 1
    }
}
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                    <h1 class="text-3xl font-bold text-gray-900">Facture de {{ facture?.type === 'vente' ? 'vente' :
                        'transport' }}</h1>
                    <UBadge v-if="facture?.cancelled" color="error" variant="soft">Annulée</UBadge>
                </div>
                <p class="text-gray-500 text-sm">
                    Identifiant comptable: <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{ facture?.id_comptable }}</span>
                </p>
            </div>
            <div class="flex space-x-4">
                <UButton color="primary" icon="i-heroicons-arrow-left" @click="handleBack">
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
                        <UButton color="neutral" variant="ghost" icon="i-heroicons-document-arrow-down" @click="handleGeneratePdf">
                            Enregistrer en PDF
                        </UButton>
                        <UDropdownMenu :items="[
                            [
                                {
                                    label: facture?.cancelled ? 'Rétablir la facture' : 'Annuler la facture',
                                    icon: facture?.cancelled ? 'i-heroicons-arrow-path' : 'i-heroicons-x-mark',
                                    onSelect: handleCancelOrRestore
                                },
                                {
                                    label: 'Supprimer la facture',
                                    icon: 'i-heroicons-trash',
                                    color: 'error',
                                    onSelect: handleDelete
                                }
                            ]
                        ]">
                            <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-vertical" />
                        </UDropdownMenu>
                    </div>
                </div>
                <FactureVenteDetails v-if="facture?.type === 'vente'" :facture-id="facture.id" />
                <FactureTransportDetails v-if="facture?.type === 'transport'" :facture-id="facture.id" />
            </div>
        </div>
        <UModal v-model:open="showDeleteModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Confirmer la suppression</h3>
                            <UButton
                                color="neutral"
                                variant="ghost"
                                icon="i-heroicons-x-mark"
                                @click="showDeleteModal = false"
                            />
                        </div>
                    </template>

                    <p class="text-gray-500">
                        Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
                    </p>

                    <template #footer>
                        <div class="flex justify-end gap-3">
                            <UButton
                                color="neutral"
                                variant="ghost"
                                @click="showDeleteModal = false"
                            >
                                Annuler
                            </UButton>
                            <UButton
                                color="error"
                                variant="solid"
                                @click="handleDeleteConfirm"
                            >
                                Supprimer
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
