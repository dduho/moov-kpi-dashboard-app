const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_dev_2025'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AbW9vdi5jb20iLCJpYXQiOjE3NjE0ODM0MTAsImV4cCI6MTc2MTU2OTgxMH0.kz1p7FUkASYLglIYtMiOO4K5vC1epLzhBuVxhOyB5_s'

console.log('Testing JWT verification...')
console.log('Secret:', secret.substring(0, 20) + '...')
console.log('Token:', token.substring(0, 30) + '...')

try {
  const decoded = jwt.verify(token, secret)
  console.log('\n✅ Token is VALID')
  console.log('Decoded payload:', decoded)
} catch (error) {
  console.log('\n❌ Token is INVALID')
  console.log('Error:', error.message)
}

// Test the middleware function
console.log('\n\nTesting middleware function...')
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization
  console.log('Auth header:', authHeader)

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    console.log('Extracted token:', token.substring(0, 30) + '...')

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        console.log('Verification error:', err.message)
        return res.sendStatus(403)
      }
      console.log('✅ Verification successful, user:', user)
      req.user = user
      next()
    })
  } else {
    console.log('❌ No valid auth header')
    res.sendStatus(401)
  }
}

// Mock request/response
const mockReq = {
  headers: {
    authorization: `Bearer ${token}`
  }
}

const mockRes = {
  sendStatus: (status) => {
    console.log(`Response: ${status}`)
  }
}

const mockNext = () => {
  console.log('✅ Middleware passed, calling next()')
}

authenticateJWT(mockReq, mockRes, mockNext)
