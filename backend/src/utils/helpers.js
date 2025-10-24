class Helpers {
  static formatCurrency(amount, currency = 'XOF') {
    if (!amount) return '0'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  static formatNumber(num) {
    if (!num) return '0'
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  static formatPercentage(value, decimals = 2) {
    if (!value) return '0%'
    return `${parseFloat(value).toFixed(decimals)}%`
  }

  static calculateChange(current, previous) {
    if (!previous || previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(2)
  }

  static getChangeIndicator(change) {
    const numChange = parseFloat(change)
    if (numChange > 0) return '↗️'
    if (numChange < 0) return '↘️'
    return '➡️'
  }

  static formatDate(dateStr) {
    if (!dateStr) return ''
    // Assuming dateStr is in YYYYMMDD format
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${day}/${month}/${year}`
  }

  static parseDate(dateStr) {
    if (!dateStr) return null
    // Assuming dateStr is in YYYYMMDD format
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    return new Date(year, month, day)
  }

  static getDateRange(days) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    return {
      start: this.formatDateForAPI(start),
      end: this.formatDateForAPI(end)
    }
  }

  static formatDateForAPI(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  static validateDate(dateStr) {
    const date = this.parseDate(dateStr)
    return date instanceof Date && !isNaN(date)
  }

  static getBusinessTypeColor(businessType) {
    const colors = {
      'B2B': '#FF6B6B',
      'B2C': '#4ECDC4',
      'AIRD': '#45B7D1',
      'MERCH': '#96CEB4',
      'P2P': '#FFEAA7',
      'BILL': '#DDA0DD',
      'TELCO': '#98D8C8',
      'BANK': '#F7DC6F',
      'IMT': '#BB8FCE'
    }
    return colors[businessType] || '#BDC3C7'
  }

  static getSuccessRateColor(rate) {
    const numRate = parseFloat(rate)
    if (numRate >= 95) return 'success'
    if (numRate >= 90) return 'warning'
    return 'error'
  }

  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  static throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

module.exports = Helpers