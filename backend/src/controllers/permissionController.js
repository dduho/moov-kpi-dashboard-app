const { Permission, Role } = require('../models')
const { Op } = require('sequelize')

class PermissionController {
  // Get all permissions
  async getAllPermissions(req, res) {
    try {
      const { resource } = req.query

      const whereClause = {}
      if (resource) {
        whereClause.resource = resource
      }

      const permissions = await Permission.findAll({
        where: whereClause,
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name']
        }],
        order: [['resource', 'ASC'], ['action', 'ASC']]
      })

      // Group permissions by resource
      const groupedPermissions = permissions.reduce((acc, permission) => {
        const resource = permission.resource
        if (!acc[resource]) {
          acc[resource] = []
        }
        acc[resource].push({
          id: permission.id,
          name: permission.name,
          action: permission.action,
          description: permission.description,
          roles: permission.roles
        })
        return acc
      }, {})

      res.json({
        success: true,
        data: {
          permissions,
          groupedPermissions
        }
      })
    } catch (error) {
      console.error('Get permissions error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Get permission by ID
  async getPermissionById(req, res) {
    try {
      const { id } = req.params

      const permission = await Permission.findByPk(id, {
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        }]
      })

      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found'
        })
      }

      res.json({
        success: true,
        data: { permission }
      })
    } catch (error) {
      console.error('Get permission error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Create new permission
  async createPermission(req, res) {
    try {
      const { name, description, resource, action } = req.body

      // Check if permission already exists
      const existingPermission = await Permission.findOne({
        where: { resource, action }
      })

      if (existingPermission) {
        return res.status(400).json({
          success: false,
          message: 'Permission already exists for this resource and action'
        })
      }

      // Create permission
      const permission = await Permission.create({
        name: name || `${resource}:${action}`,
        description,
        resource,
        action
      })

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: { permission }
      })
    } catch (error) {
      console.error('Create permission error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Update permission
  async updatePermission(req, res) {
    try {
      const { id } = req.params
      const { name, description } = req.body

      const permission = await Permission.findByPk(id)
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found'
        })
      }

      // Update permission
      await permission.update({
        name: name || permission.name,
        description: description !== undefined ? description : permission.description
      })

      res.json({
        success: true,
        message: 'Permission updated successfully',
        data: { permission }
      })
    } catch (error) {
      console.error('Update permission error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Delete permission
  async deletePermission(req, res) {
    try {
      const { id } = req.params

      const permission = await Permission.findByPk(id)
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found'
        })
      }

      // Check if permission is assigned to roles
      const rolesCount = await permission.countRoles()
      if (rolesCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete permission that is assigned to roles'
        })
      }

      await permission.destroy()

      res.json({
        success: true,
        message: 'Permission deleted successfully'
      })
    } catch (error) {
      console.error('Delete permission error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Get permissions by resource
  async getPermissionsByResource(req, res) {
    try {
      const { resource } = req.params

      const permissions = await Permission.findAll({
        where: { resource },
        order: [['action', 'ASC']]
      })

      res.json({
        success: true,
        data: { permissions }
      })
    } catch (error) {
      console.error('Get permissions by resource error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Get all available resources
  async getResources(req, res) {
    try {
      const resources = await Permission.findAll({
        attributes: ['resource'],
        group: ['resource'],
        order: [['resource', 'ASC']]
      })

      const resourceList = resources.map(r => r.resource)

      res.json({
        success: true,
        data: { resources: resourceList }
      })
    } catch (error) {
      console.error('Get resources error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

module.exports = new PermissionController()