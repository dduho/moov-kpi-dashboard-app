const ExcelJS = require('exceljs')
const DailyKpi = require('../models/DailyKpi')
const HourlyKpi = require('../models/HourlyKpi')
const ImtTransaction = require('../models/ImtTransaction')
const RevenueByChannel = require('../models/RevenueByChannel')

class ExportController {
  async exportToExcel(req, res, next) {
    try {
      const { date, type } = req.query

      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Moov KPI Dashboard'
      workbook.created = new Date()

      if (type === 'daily' || !type) {
        await this.addDailyKpiSheet(workbook, date)
      }

      if (type === 'hourly' || !type) {
        await this.addHourlyKpiSheet(workbook, date)
      }

      if (type === 'imt' || !type) {
        await this.addImtSheet(workbook, date)
      }

      if (type === 'revenue' || !type) {
        await this.addRevenueSheet(workbook, date)
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=kpi-export-${date}.xlsx`)

      await workbook.xlsx.write(res)
      res.end()
    } catch (error) {
      next(error)
    }
  }

  async exportToPdf(req, res, next) {
    try {
      // For PDF export, we'll use a simple HTML to PDF conversion
      // In a real implementation, you might use puppeteer or similar
      const { date } = req.query

      const [dailyKpis, hourlyKpis, imtData, revenueData] = await Promise.all([
        DailyKpi.findAll({ where: { date } }),
        HourlyKpi.findAll({ where: { date } }),
        ImtTransaction.findAll({ where: { date } }),
        RevenueByChannel.findAll({ where: { date } })
      ])

      const html = this.generatePdfHtml(date, { dailyKpis, hourlyKpis, imtData, revenueData })

      // In a real implementation, convert HTML to PDF
      // For now, return HTML as placeholder
      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Content-Disposition', `attachment; filename=kpi-report-${date}.html`)
      res.send(html)
    } catch (error) {
      next(error)
    }
  }

  async addDailyKpiSheet(workbook, date) {
    const worksheet = workbook.addWorksheet('Daily KPIs')
    const dailyKpis = await DailyKpi.findAll({
      where: { date },
      order: [['business_type', 'ASC']]
    })

    // Add headers
    worksheet.columns = [
      { header: 'Business Type', key: 'business_type', width: 15 },
      { header: 'Period', key: 'period', width: 10 },
      { header: 'Success Transactions', key: 'success_trx', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Tax', key: 'tax', width: 10 },
      { header: 'Failed Transactions', key: 'failed_trx', width: 20 },
      { header: 'Expired Transactions', key: 'expired_trx', width: 20 },
      { header: 'Success Rate', key: 'success_rate', width: 15 },
      { header: 'Revenue Rate', key: 'revenue_rate', width: 15 }
    ]

    // Style headers
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    }

    // Add data
    dailyKpis.forEach(kpi => {
      worksheet.addRow({
        business_type: kpi.business_type,
        period: kpi.period,
        success_trx: kpi.success_trx,
        amount: kpi.amount,
        revenue: kpi.revenue,
        commission: kpi.commission,
        tax: kpi.tax,
        failed_trx: kpi.failed_trx,
        expired_trx: kpi.expired_trx,
        success_rate: kpi.success_rate,
        revenue_rate: kpi.revenue_rate
      })
    })
  }

  async addHourlyKpiSheet(workbook, date) {
    const worksheet = workbook.addWorksheet('Hourly KPIs')
    const hourlyKpis = await HourlyKpi.findAll({
      where: { date },
      order: [['hour', 'ASC'], ['txn_type_name', 'ASC']]
    })

    worksheet.columns = [
      { header: 'Hour', key: 'hour', width: 10 },
      { header: 'Transaction Type', key: 'txn_type_name', width: 20 },
      { header: 'Total Transactions', key: 'total_trans', width: 20 },
      { header: 'Success', key: 'total_success', width: 15 },
      { header: 'Failed', key: 'total_failed', width: 15 },
      { header: 'Pending', key: 'total_pending', width: 15 },
      { header: 'Amount', key: 'total_amount', width: 15 },
      { header: 'Fee', key: 'total_fee', width: 15 },
      { header: 'Commission', key: 'total_commission', width: 15 },
      { header: 'Tax', key: 'total_tax', width: 15 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    }

    hourlyKpis.forEach(kpi => {
      worksheet.addRow({
        hour: kpi.hour,
        txn_type_name: kpi.txn_type_name,
        total_trans: kpi.total_trans,
        total_success: kpi.total_success,
        total_failed: kpi.total_failed,
        total_pending: kpi.total_pending,
        total_amount: kpi.total_amount,
        total_fee: kpi.total_fee,
        total_commission: kpi.total_commission,
        total_tax: kpi.total_tax
      })
    })
  }

  async addImtSheet(workbook, date) {
    const worksheet = workbook.addWorksheet('IMT Transactions')
    const imtData = await ImtTransaction.findAll({
      where: { date },
      order: [['country', 'ASC'], ['imt_business', 'ASC']]
    })

    worksheet.columns = [
      { header: 'Country', key: 'country', width: 15 },
      { header: 'IMT Business', key: 'imt_business', width: 15 },
      { header: 'Success', key: 'total_success', width: 15 },
      { header: 'Failed', key: 'total_failed', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Success Rate', key: 'success_rate', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    }

    imtData.forEach(item => {
      worksheet.addRow({
        country: item.country,
        imt_business: item.imt_business,
        total_success: item.total_success,
        total_failed: item.total_failed,
        amount: item.amount,
        revenue: item.revenue,
        commission: item.commission,
        tax: item.tax,
        success_rate: item.success_rate,
        balance: item.balance
      })
    })
  }

  async addRevenueSheet(workbook, date) {
    const worksheet = workbook.addWorksheet('Revenue by Channel')
    const revenueData = await RevenueByChannel.findAll({
      where: { date },
      order: [['channel', 'ASC']]
    })

    worksheet.columns = [
      { header: 'Channel', key: 'channel', width: 15 },
      { header: 'Transaction Count', key: 'transaction_count', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    }

    revenueData.forEach(item => {
      worksheet.addRow({
        channel: item.channel,
        transaction_count: item.transaction_count,
        amount: item.amount,
        revenue: item.revenue,
        commission: item.commission,
        tax: item.tax
      })
    })
  }

  generatePdfHtml(date, data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KPI Report - ${date}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { background-color: #e6f3ff; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Moov KPI Dashboard Report</h1>
        <p><strong>Date:</strong> ${date}</p>

        <div class="summary">
          <h2>Daily KPIs Summary</h2>
          <p><strong>Total Transactions:</strong> ${data.dailyKpis.reduce((sum, kpi) => sum + kpi.success_trx, 0)}</p>
          <p><strong>Total Revenue:</strong> ${data.dailyKpis.reduce((sum, kpi) => sum + parseFloat(kpi.revenue), 0).toFixed(2)}</p>
        </div>

        <h2>Detailed Data</h2>
        <p>This is a placeholder for the full PDF report. In a production environment, this would be converted to PDF using a library like Puppeteer.</p>
      </body>
      </html>
    `
  }
}

module.exports = new ExportController()