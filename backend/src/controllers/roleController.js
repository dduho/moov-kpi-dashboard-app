const { Role, Permission, User } = require('../models')
const { Op } = require('sequelize')

class RoleController {
  // Get all roles
  async getAllRoles(req, res) {
    try {
      const roles = await Role.findAll({
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'resource', 'action', 'description']
        }],
        order: [['name', 'ASC']]
      })

      res.json({
        success: true,
        data: { roles }
      })
    } catch (error) {
      console.error('Get roles error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const { id } = req.params

      const role = await Role.findByPk(id, {
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'resource', 'action', 'description']
        }, {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        }]
      })

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      res.json({
        success: true,
        data: { role }
      })
    } catch (error) {
      console.error('Get role error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Create new role
  async createRole(req, res) {
    try {
      const { name, description, permissionIds } = req.body

      // Check if role already exists
      const existingRole = await Role.findOne({ where: { name } })
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        })
      }

      // Create role
      const role = await Role.create({
        name,
        description
      })

      // Assign permissions if provided
      if (permissionIds && permissionIds.length > 0) {
        const permissions = await Permission.findAll({ where: { id: permissionIds } })
        await role.setPermissions(permissions)
      }

      // Get role with permissions
      const roleWithPermissions = await Role.findByPk(role.id, {
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'resource', 'action', 'description']
        }]
      })

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { role: roleWithPermissions }
      })
    } catch (error) {
      console.error('Create role error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params
      const { name, description, permissionIds } = req.body

      const role = await Role.findByPk(id)
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Prevent modification of system roles
      if (role.isSystemRole) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify system roles'
        })
      }

      // Check if name is already taken by another role
      if (name && name !== role.name) {
        const existingRole = await Role.findOne({
          where: { name, id: { [Op.ne]: id } }
        })
        if (existingRole) {
          return res.status(400).json({
            success: false,
            message: 'Role name already exists'
          })
        }
      }

      // Update role
      await role.update({
        name: name || role.name,
        description: description !== undefined ? description : role.description
      })

      // Update permissions if provided
      if (permissionIds !== undefined) {
        const permissions = await Permission.findAll({ where: { id: permissionIds } })
        await role.setPermissions(permissions)
      }

      // Get updated role with permissions
      const updatedRole = await Role.findByPk(id, {
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'resource', 'action', 'description']
        }]
      })

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: { role: updatedRole }
      })
    } catch (error) {
      console.error('Update role error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { id } = req.params

      const role = await Role.findByPk(id)
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Prevent deletion of system roles
      if (role.isSystemRole) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete system roles'
        })
      }

      // Check if role is assigned to users
      const usersCount = await role.countUsers()
      if (usersCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role that is assigned to users'
        })
      }

      await role.destroy()

      res.json({
        success: true,
        message: 'Role deleted successfully'
      })
    } catch (error) {
      console.error('Delete role error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Get role permissions
  async getRolePermissions(req, res) {
    try {
      const { id } = req.params

      const role = await Role.findByPk(id, {
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'resource', 'action', 'description']
        }]
      })

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      res.json({
        success: true,
        data: { permissions: role.permissions }
      })
    } catch (error) {
      console.error('Get role permissions error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Update role permissions
  async updateRolePermissions(req, res) {
    try {
      const { id } = req.params
      const { permissionIds } = req.body

      const role = await Role.findByPk(id)
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        })
      }

      // Prevent modification of system roles
      if (role.isSystemRole) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify system role permissions'
        })
      }

      const permissions = await Permission.findAll({ where: { id: permissionIds } })
      await role.setPermissions(permissions)

      // Get updated role with permissions
      const updatedRole = await Role.findByPk(id, {
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'resource', 'action', 'description']
        }]
      })

      res.json({
        success: true,
        message: 'Role permissions updated successfully',
        data: { role: updatedRole }
      })
    } catch (error) {
      console.error('Update role permissions error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

module.exports = new RoleController()