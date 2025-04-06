import type { Client } from './useClients'
import { useDatabase } from './useDatabase'

export interface FactureBase {
  id: string
  type: 'vente' | 'transport'
  client?: Client
  client_id?: string
  date_creation: string
  date_modification: string
  additional_notes?: string
}

export interface FactureVente extends FactureBase {
  type: 'vente'
  vehicle_brand: string
  vehicle_model: string
  vehicle_chassis: string
  vehicle_mileage: number
  vehicle_color?: string
  vehicle_type: string
  vehicle_first_registration?: string
  vehicle_price: number
  deposit?: number
  additional_notes?: string
}

export interface FactureTransport extends FactureBase {
  type: 'transport'
  transport_date: string
  departure_location: string
  arrival_location: string
  distance: number
  price_per_km: number
  pickup_price: number
  additional_notes?: string
}

export type Facture = FactureVente | FactureTransport

interface FactureBaseDB {
  id: string
  type: 'vente' | 'transport'
  client_id?: string
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
  const db = useDatabase()
  const clientsComposable = useClients()

  // Charger les factures depuis la base de données
  const loadFactures = async (page: number = 1, limit: number = 10): Promise<Facture[]> => {
    try {
      // Charger toutes les factures de base
      const baseFactures = await db.select<FactureBaseDB[]>(
        "SELECT * FROM factures ORDER BY date_creation DESC LIMIT ? OFFSET ?",
        [limit, (page - 1) * limit]
      )

      const factures: Facture[] = []

      // Pour chaque facture de base, charger les détails spécifiques
      for (const baseDB of baseFactures) {
        // Créer une instance de facture de base
        let base: FactureBase = {
          id: baseDB.id,
          type: baseDB.type,
          client_id: baseDB.client_id,
          date_creation: baseDB.date_creation,
          date_modification: baseDB.date_modification,
        }

        // Charger le client associé à la facture
        if (baseDB.client_id) {
          const client = await clientsComposable.getClient(baseDB.client_id)
          if (client) {
            base.client = client
          }
        }

        if (base.type === 'vente') {
          const vente = await db.select<FactureVenteDB[]>(
            "SELECT * FROM factures_vente WHERE facture_id = ?",
            [base.id]
          )
          if (vente.length > 0 && vente[0]) {
            const venteData = vente[0]
            factures.push({
              ...base,
              vehicle_brand: venteData.vehicle_brand,
              vehicle_model: venteData.vehicle_model,
              vehicle_chassis: venteData.vehicle_chassis,
              vehicle_mileage: venteData.vehicle_mileage,
              vehicle_color: venteData.vehicle_color,
              vehicle_type: venteData.vehicle_type,
              vehicle_first_registration: venteData.vehicle_first_registration,
              vehicle_price: venteData.vehicle_price,
              deposit: venteData.deposit
            } as FactureVente)
          }
        } else {
          const transport = await db.select<FactureTransportDB[]>(
            "SELECT * FROM factures_transport WHERE facture_id = ?",
            [base.id]
          )
          if (transport.length > 0 && transport[0]) {
            const transportData = transport[0]
            factures.push({
              ...base,
              transport_date: transportData.transport_date,
              departure_location: transportData.departure_location,
              arrival_location: transportData.arrival_location,
              distance: transportData.distance,
              price_per_km: transportData.price_per_km,
              pickup_price: transportData.pickup_price
            } as FactureTransport)
          }
        }
      }
      return factures
    } catch (e) {
      console.error('Erreur lors du chargement des factures:', e)
      return []
    }
  }

  // Ajouter une nouvelle facture
  const addFacture = async (facture: Omit<Facture, 'id' | 'date_creation' | 'date_modification'>): Promise<string> => {
    try {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      // Insérer la facture de base
      await db.execute(
        `INSERT INTO factures (
          id, type, client_id, date_creation, date_modification, additional_notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          facture.type,
          facture.client_id,
          now,
          now,
          facture.additional_notes
        ]
      )

      // Insérer les détails spécifiques selon le type
      if (facture.type === 'vente') {
        const vente = facture as Omit<FactureVente, 'id' | 'date_creation' | 'date_modification'>
        await db.execute(
          `INSERT INTO factures_vente (
            facture_id, vehicle_brand, vehicle_model, vehicle_chassis,
            vehicle_mileage, vehicle_color, vehicle_type, vehicle_first_registration,
            vehicle_price, deposit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            vente.vehicle_brand,
            vente.vehicle_model,
            vente.vehicle_chassis,
            vente.vehicle_mileage,
            vente.vehicle_color,
            vente.vehicle_type,
            vente.vehicle_first_registration,
            vente.vehicle_price,
            vente.deposit
          ]
        )
      } else {
        const transport = facture as Omit<FactureTransport, 'id' | 'date_creation' | 'date_modification'>
        await db.execute(
          `INSERT INTO factures_transport (
            facture_id, transport_date, departure_location, arrival_location,
            distance, price_per_km, pickup_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            transport.transport_date,
            transport.departure_location,
            transport.arrival_location,
            transport.distance,
            transport.price_per_km,
            transport.pickup_price
          ]
        )
      }

      return id
    } catch (e) {
      console.error('Erreur lors de l\'ajout de la facture:', e)
      throw e
    }
  }

  // Mettre à jour une facture existante
  const updateFacture = async (id: string, facture: Omit<Facture, 'id' | 'date_creation' | 'date_modification'>): Promise<string> => {
    try {

      const now = new Date().toISOString()

      // Mettre à jour la facture de base
      await db.execute(
        `UPDATE factures SET
          type = ?, client_id = ?, date_modification = ?, additional_notes = ?
        WHERE id = ?`,
        [
          facture.type,
          facture.client_id,
          now,
          facture.additional_notes,
          id
        ]
      )

      // Mettre à jour les détails spécifiques selon le type
      if (facture.type === 'vente') {
        const vente = facture as Omit<FactureVente, 'id' | 'date_creation' | 'date_modification'>
        await db.execute(
          `UPDATE factures_vente SET
            vehicle_brand = ?, vehicle_model = ?, vehicle_chassis = ?,
            vehicle_mileage = ?, vehicle_color = ?, vehicle_type = ?,
            vehicle_first_registration = ?, vehicle_price = ?, deposit = ?
          WHERE facture_id = ?`,
          [
            vente.vehicle_brand,
            vente.vehicle_model,
            vente.vehicle_chassis,
            vente.vehicle_mileage,
            vente.vehicle_color,
            vente.vehicle_type,
            vente.vehicle_first_registration,
            vente.vehicle_price,
            vente.deposit,
            id
          ]
        )
      } else {
        const transport = facture as Omit<FactureTransport, 'id' | 'date_creation' | 'date_modification'>
        await db.execute(
          `UPDATE factures_transport SET
            transport_date = ?, departure_location = ?, arrival_location = ?,
            distance = ?, price_per_km = ?, pickup_price = ?
          WHERE facture_id = ?`,
          [
            transport.transport_date,
            transport.departure_location,
            transport.arrival_location,
            transport.distance,
            transport.price_per_km,
            transport.pickup_price,
            id
          ]
        )
      }

      return id
    } catch (e) {
      console.error('Erreur lors de la mise à jour de la facture:', e)
      throw e
    }
  }

  // Supprimer une facture
  const deleteFacture = async (id: string): Promise<void> => {
    try {

      // La suppression en cascade s'occupera des tables liées
      await db.execute("DELETE FROM factures WHERE id = ?", [id])

    } catch (e) {
      console.error('Erreur lors de la suppression de la facture:', e)
      throw e
    }
  }

  // Récupérer une facture par son ID
  const getFacture = async (id: string): Promise<Facture | undefined> => {
    try {

      const base = await db.select<FactureBaseDB[]>("SELECT * FROM factures WHERE id = ?", [id])
      if (base.length === 0 || !base[0]) return undefined

      if (base[0].type === 'vente') {
        const vente = await db.select<FactureVenteDB[]>("SELECT * FROM factures_vente WHERE facture_id = ?", [id])
        if (vente.length === 0 || !vente[0]) return undefined

        const venteData = vente[0]
        const baseDataDB = base[0]

        let baseData: FactureBase = {
          id: baseDataDB.id,
          type: baseDataDB.type,
          client_id: baseDataDB.client_id,
          date_creation: baseDataDB.date_creation,
          date_modification: baseDataDB.date_modification,
          additional_notes: baseDataDB.additional_notes
        }

        // Charger le client associé à la facture
        if (baseDataDB.client_id) {
          const client = await clientsComposable.getClient(baseDataDB.client_id)
          if (client) {
            baseData.client = client
          }
        }

        return {
          ...baseData,
          vehicle_brand: venteData.vehicle_brand,
          vehicle_model: venteData.vehicle_model,
          vehicle_chassis: venteData.vehicle_chassis,
          vehicle_mileage: venteData.vehicle_mileage,
          vehicle_color: venteData.vehicle_color,
          vehicle_type: venteData.vehicle_type,
          vehicle_first_registration: venteData.vehicle_first_registration,
          vehicle_price: venteData.vehicle_price,
          deposit: venteData.deposit
        } as FactureVente
      } else {
        const transport = await db.select<FactureTransportDB[]>("SELECT * FROM factures_transport WHERE facture_id = ?", [id])
        if (transport.length === 0 || !transport[0]) return undefined

        const transportData = transport[0]
        const baseDataDB = base[0]

        let baseData: FactureBase = {
          id: baseDataDB.id,
          type: baseDataDB.type,
          client_id: baseDataDB.client_id,
          date_creation: baseDataDB.date_creation,
          date_modification: baseDataDB.date_modification,
          additional_notes: baseDataDB.additional_notes
        }

        // Charger le client associé à la facture
        if (baseDataDB.client_id) {
          const client = await clientsComposable.getClient(baseDataDB.client_id)
          if (client) {
            baseData.client = client
          }
        }

        return {
          ...baseData,
          transport_date: transportData.transport_date,
          departure_location: transportData.departure_location,
          arrival_location: transportData.arrival_location,
          distance: transportData.distance,
          price_per_km: transportData.price_per_km,
          pickup_price: transportData.pickup_price
        } as FactureTransport
      }
    } catch (e) {
      console.error('Erreur lors de la récupération de la facture:', e)
      return undefined
    }
  }

  return {
    loadFactures,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacture
  }
} 