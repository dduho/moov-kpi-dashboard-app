const fs = require('fs').promises
const path = require('path')

// Services from the backend app (expects to run inside backend container where /app is backend root)
const ingestionService = require('../src/services/dailyDataIngestionService')
const job = require('../src/jobs/dailyDataIngestion.js')
const logger = require('../src/utils/logger')

const argv = require('minimist')(process.argv.slice(2))
const dryRun = argv['dry-run'] || argv.dry || false
const limit = argv.limit ? parseInt(argv.limit, 10) : null
const confirm = argv.confirm || false
const archive = argv.archive || argv.a || false

const rootKpi = '/backend/kpi_data'

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      const sub = await walk(full)
      files.push(...sub)
    } else if (e.isFile()) {
      files.push(full)
    }
  }
  return files
}

async function findRarFiles() {
  try {
    const exists = await fs.stat(rootKpi).catch(() => null)
    if (!exists) return []
    const all = await walk(rootKpi)
    return all.filter(f => f.toLowerCase().endsWith('.rar'))
  } catch (err) {
    console.error('Error scanning kpi_data:', err.message)
    return []
  }
}

async function processRar(rarPath) {
  // Expect rarPath like /backend/kpi_data/YYYYMM/YYYYMMDD.rar
  const baseName = path.basename(rarPath)
  const dateMatch = baseName.match(/(\d{8})\.rar$/)
  const date = dateMatch ? dateMatch[1] : null
  const month = date ? date.substring(0, 6) : null

  logger.info(`Processing RAR: ${rarPath}`)
  const extractPath = await ingestionService.extractRarFile(rarPath)

  if (date && month) {
    const dateFolder = path.join(path.dirname(rarPath), date)
    await fs.mkdir(dateFolder, { recursive: true })

    // Move Excel files recursively from extractPath into dateFolder
    const moveRec = async (current) => {
      const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => [])
      for (const e of entries) {
        const full = path.join(current, e.name)
        if (e.isDirectory()) {
          await moveRec(full)
        } else if (e.isFile()) {
          const lower = e.name.toLowerCase()
          if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
            const dest = path.join(dateFolder, e.name)
            try {
              await fs.mkdir(path.dirname(dest), { recursive: true })
              await fs.rename(full, dest)
              logger.info(`Moved extracted ${e.name} -> ${dest}`)
            } catch (err) {
              logger.warn('Move failed', err.message)
            }
          }
        }
      }
    }

    await moveRec(extractPath)

    try { await fs.rm(extractPath, { recursive: true, force: true }) } catch (e) {}

    // Trigger job to process that date
    if (date) {
      logger.info(`Triggering ingestion job for date ${date}`)
      await job.runForDate(date)
    }
  } else {
    logger.warn(`Could not infer date from rar filename: ${baseName}`)
  }
}

async function main() {
  const rars = await findRarFiles()
  console.log(`Found ${rars.length} .rar files under ${rootKpi}`)
  if (rars.length > 0) console.log('Sample:', rars.slice(0, 20).join('\n'))

  if (dryRun) {
    console.log('Dry-run mode - no extraction will be performed')
    return
  }

  if (!confirm) {
    console.log('No --confirm flag provided. To actually run extraction and processing, re-run with --confirm')
    return
  }

  let toProcess = rars
  if (limit) toProcess = toProcess.slice(0, limit)

  for (const rar of toProcess) {
    try {
      await processRar(rar)
      if (archive) {
        try {
          const month = path.basename(path.dirname(rar))
          const processedDir = path.join(rootKpi, 'processed', month)
          await fs.mkdir(processedDir, { recursive: true })
          const dest = path.join(processedDir, path.basename(rar))
          await fs.rename(rar, dest)
          logger.info(`Archived ${rar} -> ${dest}`)
        } catch (archErr) {
          logger.warn(`Failed to archive ${rar}:`, archErr.message)
        }
      }
    } catch (err) {
      logger.error(`Failed processing ${rar}:`, err)
    }
  }

  console.log('Reprocessing completed')
}

main().catch(err => {
  console.error('Fatal error in reprocessor:', err)
  process.exit(1)
})
