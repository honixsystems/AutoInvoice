import { ref } from 'vue'
import { BaseDirectory, readTextFile, writeTextFile, create, remove } from '@tauri-apps/plugin-fs'
import { appLocalDataDir } from '@tauri-apps/api/path'

export interface FactureBase {
  id: string
  type: 'vente' | 'transport'
  clientName: string
  dateCreation: string
  dateModification: string
}

export interface FactureVente extends FactureBase {
  type: 'vente'
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  clientVAT?: string
  vehicleBrand: string
  vehicleModel: string
  vehicleChassis: string
  vehicleMileage: number
  vehicleColor?: string
  vehicleType: string
  vehicleFirstRegistration?: string
  vehiclePrice: number
  deposit?: number
  additionalNotes?: string
}

export interface FactureTransport extends FactureBase {
  type: 'transport'
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  clientVAT?: string
  transportDate: string
  departureLocation: string
  arrivalLocation: string
  distance: number
  pricePerKm: number
  pickupPrice: number
  additionalNotes?: string
}

export type Facture = FactureVente | FactureTransport

const STORAGE_DIR = 'autoinvoice'
const VENTES_DIR = `${STORAGE_DIR}/ventes`
const TRANSPORTS_DIR = `${STORAGE_DIR}/transports`

export function useFactures() {
  const factures = ref<Facture[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const baseDir = ref<string>('')

  // Initialiser le répertoire de base
  const initBaseDir = async () => {
    try {
      baseDir.value = await appLocalDataDir()
    } catch (e) {
      console.error('Erreur lors de l\'initialisation du répertoire de base:', e)
      throw e
    }
  }

  // Créer les répertoires nécessaires
  const createDirectories = async () => {
    try {
      await initBaseDir()
      await create(STORAGE_DIR, { baseDir: BaseDirectory.AppLocalData })
      await create(VENTES_DIR, { baseDir: BaseDirectory.AppLocalData })
      await create(TRANSPORTS_DIR, { baseDir: BaseDirectory.AppLocalData })
    } catch (e) {
      // Ignorer l'erreur si les répertoires existent déjà
    }
  }

  // Charger les factures depuis les fichiers individuels
  const loadFactures = async () => {
    try {
      isLoading.value = true
      error.value = null

      await createDirectories()

      // Charger les factures de vente
      try {
        // Vérifier si le fichier index existe
        try {
          await readTextFile(`${VENTES_DIR}/index.json`, { baseDir: BaseDirectory.AppLocalData })
        } catch (e) {
          // Si le fichier n'existe pas, le créer avec un tableau vide
          await writeTextFile(`${VENTES_DIR}/index.json`, '[]', { baseDir: BaseDirectory.AppLocalData })
        }

        const venteFiles = await readTextFile(`${VENTES_DIR}/index.json`, { baseDir: BaseDirectory.AppLocalData })
        const venteIds = JSON.parse(venteFiles)
        for (const id of venteIds) {
          const content = await readTextFile(`${VENTES_DIR}/${id}.json`, { baseDir: BaseDirectory.AppLocalData })
          factures.value.push(JSON.parse(content))
        }
      } catch (e) {
        console.error('Erreur lors du chargement des factures de vente:', e)
        // En cas d'erreur, initialiser avec un tableau vide
        await writeTextFile(`${VENTES_DIR}/index.json`, '[]', { baseDir: BaseDirectory.AppLocalData })
      }

      // Charger les factures de transport
      try {
        // Vérifier si le fichier index existe
        try {
          await readTextFile(`${TRANSPORTS_DIR}/index.json`, { baseDir: BaseDirectory.AppLocalData })
        } catch (e) {
          // Si le fichier n'existe pas, le créer avec un tableau vide
          await writeTextFile(`${TRANSPORTS_DIR}/index.json`, '[]', { baseDir: BaseDirectory.AppLocalData })
        }

        const transportFiles = await readTextFile(`${TRANSPORTS_DIR}/index.json`, { baseDir: BaseDirectory.AppLocalData })
        const transportIds = JSON.parse(transportFiles)
        for (const id of transportIds) {
          const content = await readTextFile(`${TRANSPORTS_DIR}/${id}.json`, { baseDir: BaseDirectory.AppLocalData })
          factures.value.push(JSON.parse(content))
        }
      } catch (e) {
        console.error('Erreur lors du chargement des factures de transport:', e)
        // En cas d'erreur, initialiser avec un tableau vide
        await writeTextFile(`${TRANSPORTS_DIR}/index.json`, '[]', { baseDir: BaseDirectory.AppLocalData })
      }
    } catch (e) {
      console.error('Erreur lors du chargement des factures:', e)
      error.value = 'Erreur lors du chargement des factures'
      factures.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Mettre à jour l'index des factures
  const updateIndex = async (type: 'vente' | 'transport', id: string, action: 'add' | 'remove') => {
    const dir = type === 'vente' ? VENTES_DIR : TRANSPORTS_DIR
    const indexFile = `${dir}/index.json`
    
    try {
      const content = await readTextFile(indexFile, { baseDir: BaseDirectory.AppLocalData })
      const ids = JSON.parse(content)
      
      if (action === 'add') {
        if (!ids.includes(id)) {
          ids.push(id)
        }
      } else {
        const index = ids.indexOf(id)
        if (index > -1) {
          ids.splice(index, 1)
        }
      }
      
      await writeTextFile(indexFile, JSON.stringify(ids), { baseDir: BaseDirectory.AppLocalData })
    } catch (e) {
      console.error('Erreur lors de la mise à jour de l\'index:', e)
      throw e
    }
  }

  // Ajouter une nouvelle facture
  const addFacture = async (facture: Omit<Facture, 'id' | 'dateCreation' | 'dateModification'>) => {
    try {
      const id = crypto.randomUUID()
      const newFacture: Facture = {
        ...facture,
        id,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      } as Facture

      const dir = facture.type === 'vente' ? VENTES_DIR : TRANSPORTS_DIR
      await writeTextFile(`${dir}/${id}.json`, JSON.stringify(newFacture, null, 2), { baseDir: BaseDirectory.AppLocalData })
      await updateIndex(facture.type, id, 'add')
      
      factures.value.push(newFacture)
    } catch (e) {
      console.error('Erreur lors de l\'ajout de la facture:', e)
      error.value = 'Erreur lors de l\'ajout de la facture'
      throw e
    }
  }

  // Mettre à jour une facture existante
  const updateFacture = async (id: string, facture: Omit<Facture, 'id' | 'dateCreation' | 'dateModification'>) => {
    try {
      const existingFacture = factures.value.find(f => f.id === id)
      if (!existingFacture) {
        throw new Error('Facture non trouvée')
      }

      if (facture.type !== existingFacture.type) {
        throw new Error('Type de facture incompatible')
      }

      const updatedFacture: Facture = {
        ...facture,
        id: existingFacture.id,
        dateCreation: existingFacture.dateCreation,
        dateModification: new Date().toISOString()
      } as Facture

      const dir = facture.type === 'vente' ? VENTES_DIR : TRANSPORTS_DIR
      await writeTextFile(`${dir}/${id}.json`, JSON.stringify(updatedFacture, null, 2), { baseDir: BaseDirectory.AppLocalData })
      
      const index = factures.value.findIndex(f => f.id === id)
      factures.value[index] = updatedFacture
    } catch (e) {
      console.error('Erreur lors de la mise à jour de la facture:', e)
      error.value = 'Erreur lors de la mise à jour de la facture'
      throw e
    }
  }

  // Supprimer une facture
  const deleteFacture = async (id: string) => {
    try {
      const facture = factures.value.find(f => f.id === id)
      if (!facture) {
        throw new Error('Facture non trouvée')
      }

      const dir = facture.type === 'vente' ? VENTES_DIR : TRANSPORTS_DIR
      await remove(`${dir}/${id}.json`, { baseDir: BaseDirectory.AppLocalData })
      await updateIndex(facture.type, id, 'remove')
      
      const index = factures.value.findIndex(f => f.id === id)
      factures.value.splice(index, 1)
    } catch (e) {
      console.error('Erreur lors de la suppression de la facture:', e)
      error.value = 'Erreur lors de la suppression de la facture'
      throw e
    }
  }

  // Récupérer une facture par son ID
  const getFacture = (id: string): Facture | undefined => {
    return factures.value.find(f => f.id === id)
  }

  // Charger les factures au démarrage
  loadFactures()

  return {
    factures,
    isLoading,
    error,
    loadFactures,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacture
  }
} 