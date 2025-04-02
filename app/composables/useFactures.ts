import { ref } from 'vue'
import Database from '@tauri-apps/plugin-sql'
import type { Client } from './useClients'

export interface FactureBase {
  id: string
  type: 'vente' | 'transport'
  clientId?: string
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

interface FactureBaseDB {
  id: string
  type: 'vente' | 'transport'
  client_id?: string
  client_name: string
  client_phone?: string
  client_email?: string
  client_address?: string
  client_vat?: string
  date_creation: string
  date_modification: string
  additional_notes?: string
}

interface FactureVenteDB {
  facture_id: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_chassis: string
  vehicle_mileage: number
  vehicle_color?: string
  vehicle_type: string
  vehicle_first_registration?: string
  vehicle_price: number
  deposit?: number
}

interface FactureTransportDB {
  facture_id: string
  transport_date: string
  departure_location: string
  arrival_location: string
  distance: number
  price_per_km: number
  pickup_price: number
}

export function useFactures() {
  const factures = ref<Facture[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const db = ref<Database | null>(null)

  // Initialiser la connexion à la base de données
  const initDatabase = async () => {
    try {
      db.value = await Database.load('sqlite:autoinvoice.db')
    } catch (e) {
      console.error('Erreur lors de l\'initialisation de la base de données:', e)
      throw e
    }
  }

  // Charger les factures depuis la base de données
  const loadFactures = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (!db.value) {
        await initDatabase()
      }

      // Charger toutes les factures de base
      const baseFactures = await db.value!.select<FactureBaseDB[]>(
        "SELECT * FROM factures ORDER BY date_creation DESC"
      )

      factures.value = []

      // Pour chaque facture de base, charger les détails spécifiques
      for (const base of baseFactures) {
        if (base.type === 'vente') {
          const vente = await db.value!.select<FactureVenteDB[]>(
            "SELECT * FROM factures_vente WHERE facture_id = ?",
            [base.id]
          )
          if (vente.length > 0 && vente[0]) {
            const venteData = vente[0]
            factures.value.push({
              ...base,
              ...venteData,
              clientId: base.client_id,
              clientName: base.client_name,
              clientPhone: base.client_phone,
              clientEmail: base.client_email,
              clientAddress: base.client_address,
              clientVAT: base.client_vat,
              dateCreation: base.date_creation,
              dateModification: base.date_modification,
              additionalNotes: base.additional_notes,
              vehicleBrand: venteData.vehicle_brand,
              vehicleModel: venteData.vehicle_model,
              vehicleChassis: venteData.vehicle_chassis,
              vehicleMileage: venteData.vehicle_mileage,
              vehicleColor: venteData.vehicle_color,
              vehicleType: venteData.vehicle_type,
              vehicleFirstRegistration: venteData.vehicle_first_registration,
              vehiclePrice: venteData.vehicle_price,
              deposit: venteData.deposit
            } as FactureVente)
          }
        } else {
          const transport = await db.value!.select<FactureTransportDB[]>(
            "SELECT * FROM factures_transport WHERE facture_id = ?",
            [base.id]
          )
          if (transport.length > 0 && transport[0]) {
            const transportData = transport[0]
            factures.value.push({
              ...base,
              ...transportData,
              clientId: base.client_id,
              clientName: base.client_name,
              clientPhone: base.client_phone,
              clientEmail: base.client_email,
              clientAddress: base.client_address,
              clientVAT: base.client_vat,
              dateCreation: base.date_creation,
              dateModification: base.date_modification,
              additionalNotes: base.additional_notes,
              transportDate: transportData.transport_date,
              departureLocation: transportData.departure_location,
              arrivalLocation: transportData.arrival_location,
              distance: transportData.distance,
              pricePerKm: transportData.price_per_km,
              pickupPrice: transportData.pickup_price
            } as FactureTransport)
          }
        }
      }
    } catch (e) {
      console.error('Erreur lors du chargement des factures:', e)
      error.value = 'Erreur lors du chargement des factures'
      factures.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Ajouter une nouvelle facture
  const addFacture = async (facture: Omit<Facture, 'id' | 'dateCreation' | 'dateModification'>) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      // Insérer la facture de base
      await db.value!.execute(
        `INSERT INTO factures (
          id, type, client_id, client_name, client_phone, client_email, 
          client_address, client_vat, date_creation, date_modification, additional_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          facture.type,
          facture.clientId,
          facture.clientName,
          facture.clientPhone,
          facture.clientEmail,
          facture.clientAddress,
          facture.clientVAT,
          now,
          now,
          facture.additionalNotes
        ]
      )

      // Insérer les détails spécifiques selon le type
      if (facture.type === 'vente') {
        const vente = facture as Omit<FactureVente, 'id' | 'dateCreation' | 'dateModification'>
        await db.value!.execute(
          `INSERT INTO factures_vente (
            facture_id, vehicle_brand, vehicle_model, vehicle_chassis,
            vehicle_mileage, vehicle_color, vehicle_type, vehicle_first_registration,
            vehicle_price, deposit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            vente.vehicleBrand,
            vente.vehicleModel,
            vente.vehicleChassis,
            vente.vehicleMileage,
            vente.vehicleColor,
            vente.vehicleType,
            vente.vehicleFirstRegistration,
            vente.vehiclePrice,
            vente.deposit
          ]
        )
      } else {
        const transport = facture as Omit<FactureTransport, 'id' | 'dateCreation' | 'dateModification'>
        await db.value!.execute(
          `INSERT INTO factures_transport (
            facture_id, transport_date, departure_location, arrival_location,
            distance, price_per_km, pickup_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            transport.transportDate,
            transport.departureLocation,
            transport.arrivalLocation,
            transport.distance,
            transport.pricePerKm,
            transport.pickupPrice
          ]
        )
      }

      // Recharger les factures
      await loadFactures()
    } catch (e) {
      console.error('Erreur lors de l\'ajout de la facture:', e)
      error.value = 'Erreur lors de l\'ajout de la facture'
      throw e
    }
  }

  // Mettre à jour une facture existante
  const updateFacture = async (id: string, facture: Omit<Facture, 'id' | 'dateCreation' | 'dateModification'>) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const now = new Date().toISOString()

      // Mettre à jour la facture de base
      await db.value!.execute(
        `UPDATE factures SET
          type = ?, client_id = ?, client_name = ?, client_phone = ?, client_email = ?,
          client_address = ?, client_vat = ?, date_modification = ?, additional_notes = ?
        WHERE id = ?`,
        [
          facture.type,
          facture.clientId,
          facture.clientName,
          facture.clientPhone,
          facture.clientEmail,
          facture.clientAddress,
          facture.clientVAT,
          now,
          facture.additionalNotes,
          id
        ]
      )

      // Mettre à jour les détails spécifiques selon le type
      if (facture.type === 'vente') {
        const vente = facture as Omit<FactureVente, 'id' | 'dateCreation' | 'dateModification'>
        await db.value!.execute(
          `UPDATE factures_vente SET
            vehicle_brand = ?, vehicle_model = ?, vehicle_chassis = ?,
            vehicle_mileage = ?, vehicle_color = ?, vehicle_type = ?,
            vehicle_first_registration = ?, vehicle_price = ?, deposit = ?
          WHERE facture_id = ?`,
          [
            vente.vehicleBrand,
            vente.vehicleModel,
            vente.vehicleChassis,
            vente.vehicleMileage,
            vente.vehicleColor,
            vente.vehicleType,
            vente.vehicleFirstRegistration,
            vente.vehiclePrice,
            vente.deposit,
            id
          ]
        )
      } else {
        const transport = facture as Omit<FactureTransport, 'id' | 'dateCreation' | 'dateModification'>
        await db.value!.execute(
          `UPDATE factures_transport SET
            transport_date = ?, departure_location = ?, arrival_location = ?,
            distance = ?, price_per_km = ?, pickup_price = ?
          WHERE facture_id = ?`,
          [
            transport.transportDate,
            transport.departureLocation,
            transport.arrivalLocation,
            transport.distance,
            transport.pricePerKm,
            transport.pickupPrice,
            id
          ]
        )
      }

      // Recharger les factures
      await loadFactures()
    } catch (e) {
      console.error('Erreur lors de la mise à jour de la facture:', e)
      error.value = 'Erreur lors de la mise à jour de la facture'
      throw e
    }
  }

  // Supprimer une facture
  const deleteFacture = async (id: string) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      // La suppression en cascade s'occupera des tables liées
      await db.value!.execute("DELETE FROM factures WHERE id = ?", [id])

      // Recharger les factures
      await loadFactures()
    } catch (e) {
      console.error('Erreur lors de la suppression de la facture:', e)
      error.value = 'Erreur lors de la suppression de la facture'
      throw e
    }
  }

  // Récupérer une facture par son ID
  const getFacture = async (id: string): Promise<Facture | undefined> => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const base = await db.value!.select<FactureBaseDB[]>("SELECT * FROM factures WHERE id = ?", [id])
      if (base.length === 0 || !base[0]) return undefined

      if (base[0].type === 'vente') {
        const vente = await db.value!.select<FactureVenteDB[]>("SELECT * FROM factures_vente WHERE facture_id = ?", [id])
        if (vente.length === 0 || !vente[0]) return undefined

        const venteData = vente[0]
        const baseData = base[0]

        return {
          ...baseData,
          ...venteData,
          clientId: baseData.client_id,
          clientName: baseData.client_name,
          clientPhone: baseData.client_phone,
          clientEmail: baseData.client_email,
          clientAddress: baseData.client_address,
          clientVAT: baseData.client_vat,
          dateCreation: baseData.date_creation,
          dateModification: baseData.date_modification,
          additionalNotes: baseData.additional_notes,
          vehicleBrand: venteData.vehicle_brand,
          vehicleModel: venteData.vehicle_model,
          vehicleChassis: venteData.vehicle_chassis,
          vehicleMileage: venteData.vehicle_mileage,
          vehicleColor: venteData.vehicle_color,
          vehicleType: venteData.vehicle_type,
          vehicleFirstRegistration: venteData.vehicle_first_registration,
          vehiclePrice: venteData.vehicle_price,
          deposit: venteData.deposit
        } as FactureVente
      } else {
        const transport = await db.value!.select<FactureTransportDB[]>("SELECT * FROM factures_transport WHERE facture_id = ?", [id])
        if (transport.length === 0 || !transport[0]) return undefined

        const transportData = transport[0]
        const baseData = base[0]

        return {
          ...baseData,
          ...transportData,
          clientId: baseData.client_id,
          clientName: baseData.client_name,
          clientPhone: baseData.client_phone,
          clientEmail: baseData.client_email,
          clientAddress: baseData.client_address,
          clientVAT: baseData.client_vat,
          dateCreation: baseData.date_creation,
          dateModification: baseData.date_modification,
          additionalNotes: baseData.additional_notes,
          transportDate: transportData.transport_date,
          departureLocation: transportData.departure_location,
          arrivalLocation: transportData.arrival_location,
          distance: transportData.distance,
          pricePerKm: transportData.price_per_km,
          pickupPrice: transportData.pickup_price
        } as FactureTransport
      }
    } catch (e) {
      console.error('Erreur lors de la récupération de la facture:', e)
      error.value = 'Erreur lors de la récupération de la facture'
      return undefined
    }
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