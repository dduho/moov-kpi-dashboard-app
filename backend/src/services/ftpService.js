const ftp = require('basic-ftp')
const fs = require('fs').promises
const path = require('path')

class FtpService {
  constructor() {
    this.config = {
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false
    }
  }

  async connect() {
    const client = new ftp.Client()
    client.ftp.verbose = false
    await client.access(this.config)
    return client
  }

  async downloadFile(remoteFileName, localPath) {
    const client = await this.connect()
    try {
      await client.downloadTo(localPath, path.join(process.env.FTP_REMOTE_PATH || '/', remoteFileName))
    } finally {
      client.close()
    }
  }

  async uploadFile(localPath, remoteFileName) {
    const client = await this.connect()
    try {
      await client.uploadFrom(localPath, path.join(process.env.FTP_REMOTE_PATH || '/', remoteFileName))
    } finally {
      client.close()
    }
  }

  async listFiles(remotePath = '/') {
    const client = await this.connect()
    try {
      return await client.list(remotePath)
    } finally {
      client.close()
    }
  }

  async fileExists(remoteFileName) {
    const client = await this.connect()
    try {
      const files = await client.list(process.env.FTP_REMOTE_PATH || '/')
      return files.some(file => file.name === remoteFileName)
    } finally {
      client.close()
    }
  }

  async getFileSize(remoteFileName) {
    const client = await this.connect()
    try {
      const files = await client.list(process.env.FTP_REMOTE_PATH || '/')
      const file = files.find(f => f.name === remoteFileName)
      return file ? file.size : 0
    } finally {
      client.close()
    }
  }

  async getFileModifiedTime(remoteFileName) {
    const client = await this.connect()
    try {
      const files = await client.list(process.env.FTP_REMOTE_PATH || '/')
      const file = files.find(f => f.name === remoteFileName)
      return file ? file.modifiedAt : null
    } finally {
      client.close()
    }
  }
}

module.exports = new FtpService()