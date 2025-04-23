import { useDatabase } from './useDatabase'
import { FactureBase } from '~/types/facture/common'
import { FactureVente } from '~/types/facture/vente'
import { FactureTransport } from '~/types/facture/transport'
import type { Facture, FactureBaseDB } from '~/types/facture/common'
import type { FactureVenteDB } from '~/types/facture/vente'
import type { FactureTransportDB } from '~/types/facture/transport'

export function useFactures() {
  const db = useDatabase()
  const clientsComposable = useClients()

  // Fonction pour générer l'ID comptable
  const generateIdComptable = async (): Promise<string> => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '')

    // Récupérer le nombre de factures créées aujourd'hui
    const today = now.toISOString().split('T')[0]
    const result = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM factures WHERE date(date_creation) = date(?)",
      [today]
    )

    const count = (result[0]?.count || 0) + 1
    return `${dateStr}-${count.toString().padStart(3, '0')}`
  }

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
        const base = new FactureBase(baseDB)

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
            factures.push(new FactureVente({
              ...base,
              type: 'vente',
              vehicle_brand: venteData.vehicle_brand,
              vehicle_model: venteData.vehicle_model,
              vehicle_chassis: venteData.vehicle_chassis,
              vehicle_mileage: venteData.vehicle_mileage,
              vehicle_color: venteData.vehicle_color,
              vehicle_type: venteData.vehicle_type,
              vehicle_first_registration: venteData.vehicle_first_registration,
              vehicle_price: venteData.vehicle_price,
              deposit: venteData.deposit
            }))
          }
        } else {
          const transport = await db.select<FactureTransportDB[]>(
            "SELECT * FROM factures_transport WHERE facture_id = ?",
            [base.id]
          )
          if (transport.length > 0 && transport[0]) {
            const transportData = transport[0]
            factures.push(new FactureTransport({
              ...base,
              type: 'transport',
              transport_date: transportData.transport_date,
              departure_location: transportData.departure_location,
              arrival_location: transportData.arrival_location,
              distance: transportData.distance,
              price_per_km: transportData.price_per_km,
              pickup_price: transportData.pickup_price
            }))
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
  const addFacture = async (facture: Omit<Facture, 'id' | 'date_creation' | 'date_modification' | 'id_comptable'>): Promise<string> => {
    try {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const idComptable = await generateIdComptable()

      // Insérer la facture de base
      await db.execute(
        `INSERT INTO factures (
          id, type, client_id, date_creation, date_modification, additional_notes, id_comptable
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          facture.type,
          facture.client_id,
          now,
          now,
          facture.additional_notes,
          idComptable
        ]
      )

      // Insérer les détails spécifiques selon le type
      if (facture.type === 'vente') {
        const vente = facture as Omit<FactureVente, 'id' | 'date_creation' | 'date_modification'>
        await db.execute(
          `INSERT INTO factures_vente (
            facture_id, vehicle_brand, vehicle_model, vehicle_chassis,
            vehicle_mileage, vehicle_color, vehicle_type, vehicle_first_registration,
            vehicle_price, delivered_with, deposit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            JSON.stringify(vente.delivered_with),
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
            vehicle_first_registration = ?, vehicle_price = ?, delivered_with = ?, deposit = ?
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
            JSON.stringify(vente.delivered_with),
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
        const baseData = new FactureBase(base[0])

        // Charger le client associé à la facture
        if (base[0].client_id) {
          const client = await clientsComposable.getClient(base[0].client_id)
          if (client) {
            baseData.client = client
          }
        }

        return new FactureVente({
          ...baseData,
          type: 'vente',
          vehicle_brand: venteData.vehicle_brand,
          vehicle_model: venteData.vehicle_model,
          vehicle_chassis: venteData.vehicle_chassis,
          vehicle_mileage: venteData.vehicle_mileage,
          vehicle_color: venteData.vehicle_color,
          vehicle_type: venteData.vehicle_type,
          vehicle_first_registration: venteData.vehicle_first_registration,
          vehicle_price: venteData.vehicle_price,
          delivered_with: JSON.parse(venteData.delivered_with),
          deposit: venteData.deposit
        })
      } else {
        const transport = await db.select<FactureTransportDB[]>("SELECT * FROM factures_transport WHERE facture_id = ?", [id])
        if (transport.length === 0 || !transport[0]) return undefined

        const transportData = transport[0]
        const baseData = new FactureBase(base[0])

        // Charger le client associé à la facture
        if (base[0].client_id) {
          const client = await clientsComposable.getClient(base[0].client_id)
          if (client) {
            baseData.client = client
          }
        }

        return new FactureTransport({
          ...baseData,
          type: 'transport',
          transport_date: transportData.transport_date,
          departure_location: transportData.departure_location,
          arrival_location: transportData.arrival_location,
          distance: transportData.distance,
          price_per_km: transportData.price_per_km,
          pickup_price: transportData.pickup_price
        })
      }
    } catch (e) {
      console.error('Erreur lors de la récupération de la facture:', e)
      return undefined
    }
  }

  const cancelFacture = async (id: string): Promise<void> => {
    try {
      await db.execute("UPDATE factures SET cancelled = TRUE WHERE id = ?", [id])
    } catch (e) {
      console.error('Erreur lors de la suppression de la facture:', e)
      throw e
    }
  }

  const unCancelFacture = async (id: string): Promise<void> => {
    try {
      await db.execute("UPDATE factures SET cancelled = FALSE WHERE id = ?", [id])
    } catch (e) {
      console.error('Erreur lors de la suppression de la facture:', e)
      throw e
    }
  }

  // Fonctions pour les statistiques
  const getMonthlyStats = async (): Promise<{
    currentMonth: {
      ventes: number;
      transport: number;
    };
    previousMonth: {
      ventes: number;
      transport: number;
    };
  }> => {
    try {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

      // Requête pour le mois courant
      const currentMonthStats = await db.select<{ type: string; count: number }[]>(
        `SELECT type, COUNT(*) as count 
         FROM factures 
         WHERE strftime('%m', date_creation) = ? 
         AND strftime('%Y', date_creation) = ?
         AND cancelled = FALSE
         GROUP BY type`,
        [
          currentMonth.toString().padStart(2, '0'),
          currentYear.toString()
        ]
      )

      // Requête pour le mois précédent
      const previousMonthStats = await db.select<{ type: string; count: number }[]>(
        `SELECT type, COUNT(*) as count 
         FROM factures 
         WHERE strftime('%m', date_creation) = ? 
         AND strftime('%Y', date_creation) = ?
         AND cancelled = FALSE
         GROUP BY type`,
        [
          previousMonth.toString().padStart(2, '0'),
          previousYear.toString()
        ]
      )

      return {
        currentMonth: {
          ventes: currentMonthStats.find(s => s.type === 'vente')?.count || 0,
          transport: currentMonthStats.find(s => s.type === 'transport')?.count || 0
        },
        previousMonth: {
          ventes: previousMonthStats.find(s => s.type === 'vente')?.count || 0,
          transport: previousMonthStats.find(s => s.type === 'transport')?.count || 0
        }
      }
    } catch (e) {
      console.error('Erreur lors du calcul des statistiques:', e)
      return {
        currentMonth: { ventes: 0, transport: 0 },
        previousMonth: { ventes: 0, transport: 0 }
      }
    }
  }

  return {
    loadFactures,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacture,
    cancelFacture,
    unCancelFacture,
    getMonthlyStats
  }
} 