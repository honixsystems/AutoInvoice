import type { Facture } from '~/composables/useFactures'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '_')
}

const formatString = (str: string) => {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // Remplace tous les caractères spéciaux et espaces par des underscores
    .replace(/^_+|_+$/g, '') // Enlève les underscores au début et à la fin
}

export const generateFacturePath = (facture: Facture): string => {
  if (!facture) return ''

  if (facture.type === 'vente') {
    return `facture_${facture.type}_${formatString(facture.vehicle_brand)}_${formatString(facture.vehicle_model)}_${formatDate(facture.date_modification)}.pdf`
  } else if (facture.type === 'transport') {
    return `facture_${facture.type}_${formatString(facture.departure_location)}_${formatString(facture.arrival_location)}_${formatDate(facture.date_modification)}.pdf`
  }

  return ''
} 