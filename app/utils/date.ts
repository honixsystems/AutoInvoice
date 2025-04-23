export const formatDate = (date: string) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return date
  }
}

export const formatDateWithTime = (date: string) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return date
  }
}

export const formatDateForFilename = (date: string) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '_')
  } catch (error) {
    return date
  }
}

export const formatDateForTypst = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}


