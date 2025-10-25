const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const userManagementController = require('../controllers/userManagementController')
const roleController = require('../controllers/roleController')
const permissionController = require('../controllers/permissionController')
const { authenticateToken, requirePermission, requireRole } = require('../middleware/auth')

// Auth routes (public)
router.post('/login', authController.login)
router.post('/logout', authController.logout)

// Protected routes
router.use(authenticateToken)

// User profile routes
router.get('/profile', authController.getProfile)
router.post('/refresh-token', authController.refreshToken)

// User management routes (require admin role)
router.get('/users', requireRole('Administrator'), userManagementController.getAllUsers)
router.get('/users/:id', requireRole('Administrator'), userManagementController.getUserById)
router.post('/users', requireRole('Administrator'), userManagementController.createUser)
router.put('/users/:id', requireRole('Administrator'), userManagementController.updateUser)
router.delete('/users/:id', requireRole('Administrator'), userManagementController.deleteUser)
router.post('/users/:id/change-password', requirePermission('users', 'update'), userManagementController.changePassword)

// Role management routes (require admin role)
router.get('/roles', requireRole('Administrator'), roleController.getAllRoles)
router.get('/roles/:id', requireRole('Administrator'), roleController.getRoleById)
router.post('/roles', requireRole('Administrator'), roleController.createRole)
router.put('/roles/:id', requireRole('Administrator'), roleController.updateRole)
router.delete('/roles/:id', requireRole('Administrator'), roleController.deleteRole)
router.get('/roles/:id/permissions', requireRole('Administrator'), roleController.getRolePermissions)
router.put('/roles/:id/permissions', requireRole('Administrator'), roleController.updateRolePermissions)

// Permission management routes (require admin role)
router.get('/permissions', requireRole('Administrator'), permissionController.getAllPermissions)
router.get('/permissions/:id', requireRole('Administrator'), permissionController.getPermissionById)
router.post('/permissions', requireRole('Administrator'), permissionController.createPermission)
router.put('/permissions/:id', requireRole('Administrator'), permissionController.updatePermission)
router.delete('/permissions/:id', requireRole('Administrator'), permissionController.deletePermission)
router.get('/permissions/resources/:resource', requireRole('Administrator'), permissionController.getPermissionsByResource)
router.get('/permissions/resources', requireRole('Administrator'), permissionController.getResources)

module.exports = router