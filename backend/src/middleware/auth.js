const jwt = require('jsonwebtoken')
const { User, Role, Permission } = require('../models')

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  )
}

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

    // Get user with roles and permissions
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'roles',
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      }]
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      })
    }

    req.user = user
    req.user.permissions = extractPermissions(user.roles || [])
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    })
  }
}

// Legacy function for backward compatibility
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

// Check if user has specific permission
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const hasPermission = req.user.permissions.some(permission =>
      permission.resource === resource && permission.action === action
    )

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}

// Check if user has any of the specified permissions
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const hasPermission = permissions.some(({ resource, action }) =>
      req.user.permissions.some(permission =>
        permission.resource === resource && permission.action === action
      )
    )

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}

// Check if user has specific role
const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const hasRole = req.user.roles.some(role => role.name === roleName)

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role permissions'
      })
    }

    next()
  }
}

// Extract permissions from roles
const extractPermissions = (roles) => {
  const permissions = []
  roles.forEach(role => {
    if (role.permissions) {
      role.permissions.forEach(permission => {
        if (!permissions.some(p => p.id === permission.id)) {
          permissions.push({
            id: permission.id,
            name: permission.name,
            resource: permission.resource,
            action: permission.action
          })
        }
      })
    }
  })
  return permissions
}

module.exports = {
  generateToken,
  authenticateToken,
  authenticateJWT, // Legacy
  requirePermission,
  requireAnyPermission,
  requireRole,
  extractPermissions
}
