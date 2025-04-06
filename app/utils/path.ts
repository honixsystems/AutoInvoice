import type { Facture } from '~/composables/useFactures'
import { formatDateForFilename } from './date'

const formatString = (str: string) => {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // Remplace tous les caractères spéciaux et espaces par des underscores
    .replace(/^_+|_+$/g, '') // Enlève les underscores au début et à la fin
}

export const generateFacturePath = (facture: Facture): string => {
  if (!facture) return ''

  if (facture.type === 'vente') {
    return `facture_${facture.type}_${formatString(facture.vehicle_brand)}_${formatString(facture.vehicle_model)}_${formatDateForFilename(facture.date_modification)}.pdf`
  } else if (facture.type === 'transport') {
    return `facture_${facture.type}_${formatString(facture.departure_location)}_${formatString(facture.arrival_location)}_${formatDateForFilename(facture.date_modification)}.pdf`
  }

  return ''
} 