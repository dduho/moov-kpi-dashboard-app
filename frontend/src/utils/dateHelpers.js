/**
 * Date Helper Functions for Mobile Money KPI Dashboard
 * Handles date formatting, range calculations, and conversions
 */

/**
 * Format date for API (YYYYMMDD)
 * @param {Date|string} date - Date object or string
 * @returns {string} - Formatted date YYYYMMDD
 */
export const formatDateForAPI = (date) => {
  if (typeof date === 'string' && /^\d{8}$/.test(date)) {
    return date // Already in correct format
  }

  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Format date for display (DD/MM/YYYY)
 * @param {string|Date} date - Date in YYYYMMDD or Date object
 * @returns {string} - Formatted date DD/MM/YYYY
 */
export const formatDateForDisplay = (date) => {
  if (!date) return ''

  let d
  if (typeof date === 'string') {
    // Handle YYYYMMDD or YYYY-MM-DD
    const str = date.replace(/-/g, '')
    const year = str.substring(0, 4)
    const month = str.substring(4, 6)
    const day = str.substring(6, 8)
    return `${day}/${month}/${year}`
  }

  d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Get date range presets
 * @param {string} preset - Preset name
 * @returns {object} - { startDate, endDate, label }
 */
export const getDateRangePreset = (preset) => {
  const today = new Date()
  const endDate = new Date(today)
  let startDate = new Date(today)

  switch (preset) {
    case 'J-1':
      // Yesterday
      startDate.setDate(today.getDate() - 1)
      endDate.setDate(today.getDate() - 1)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: 'Hier'
      }

    case 'J-7':
      // Last 7 days
      startDate.setDate(today.getDate() - 7)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: '7 derniers jours'
      }

    case 'J-30':
      // Last 30 days
      startDate.setDate(today.getDate() - 30)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: '30 derniers jours'
      }

    case 'current-month':
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: 'Mois en cours'
      }

    case 'last-month':
      // Last month
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      endDate = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: 'Mois dernier'
      }

    case '3-months':
      // Last 3 months
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: '3 derniers mois'
      }

    case 'current-year':
      // Current year
      startDate = new Date(today.getFullYear(), 0, 1)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: 'Année en cours'
      }

    default:
      // Default: last 7 days
      startDate.setDate(today.getDate() - 7)
      return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        label: '7 derniers jours'
      }
  }
}

/**
 * Get previous period for comparison
 * @param {string} startDate - Start date YYYYMMDD
 * @param {string} endDate - End date YYYYMMDD
 * @returns {object} - { previousStartDate, previousEndDate }
 */
export const getPreviousPeriod = (startDate, endDate) => {
  const start = parseAPIDate(startDate)
  const end = parseAPIDate(endDate)

  // Calculate the number of days in the period
  const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1

  // Previous period starts before the start date
  const previousEnd = new Date(start)
  previousEnd.setDate(previousEnd.getDate() - 1)

  const previousStart = new Date(previousEnd)
  previousStart.setDate(previousStart.getDate() - daysDiff + 1)

  return {
    previousStartDate: formatDateForAPI(previousStart),
    previousEndDate: formatDateForAPI(previousEnd)
  }
}

/**
 * Parse API date format (YYYYMMDD) to Date object
 * @param {string} dateStr - Date string YYYYMMDD
 * @returns {Date} - Date object
 */
export const parseAPIDate = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return new Date()

  const year = parseInt(dateStr.substring(0, 4))
  const month = parseInt(dateStr.substring(4, 6)) - 1
  const day = parseInt(dateStr.substring(6, 8))

  return new Date(year, month, day)
}

/**
 * Get all preset options for date range selector
 * @returns {array} - Array of preset objects
 */
export const getDatePresets = () => {
  return [
    { value: 'J-1', label: 'Hier', days: 1 },
    { value: 'J-7', label: '7 derniers jours', days: 7 },
    { value: 'J-30', label: '30 derniers jours', days: 30 },
    { value: 'current-month', label: 'Mois en cours' },
    { value: 'last-month', label: 'Mois dernier' },
    { value: '3-months', label: '3 derniers mois' },
    { value: 'current-year', label: 'Année en cours' },
    { value: 'custom', label: 'Personnalisé' }
  ]
}

/**
 * Calculate trend percentage between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} - Trend percentage (positive or negative)
 */
export const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Format number with separators
 * @param {number} value - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * Format currency (XOF)
 * @param {number} value - Amount to format
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Get days between two dates
 * @param {string} startDate - Start date YYYYMMDD
 * @param {string} endDate - End date YYYYMMDD
 * @returns {number} - Number of days
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = parseAPIDate(startDate)
  const end = parseAPIDate(endDate)
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
}
