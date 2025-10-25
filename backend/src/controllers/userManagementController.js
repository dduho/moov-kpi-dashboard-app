const { Op } = require('sequelize')
const { User, Role, Permission } = require('../models')
const { generateToken } = require('../middleware/auth')

class UserManagementController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query
      const offset = (page - 1) * limit

      const whereClause = {}
      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } }
        ]
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] }
      })

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      })
    } catch (error) {
      console.error('Get users error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params

      const user = await User.findByPk(id, {
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        }],
        attributes: { exclude: ['password'] }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      res.json({
        success: true,
        data: { user }
      })
    } catch (error) {
      console.error('Get user error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const { username, email, password, firstName, lastName, roleIds } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        })
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName
      })

      // Assign roles if provided
      if (roleIds && roleIds.length > 0) {
        const roles = await Role.findAll({ where: { id: roleIds } })
        await user.setRoles(roles)
      }

      // Get user with roles
      const userWithRoles = await User.findByPk(user.id, {
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        }],
        attributes: { exclude: ['password'] }
      })

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userWithRoles }
      })
    } catch (error) {
      console.error('Create user error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params
      const { email, firstName, lastName, roleIds, isActive } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          where: { email, id: { [Op.ne]: id } }
        })
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          })
        }
      }

      // Update user
      await user.update({
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        isActive: isActive !== undefined ? isActive : user.isActive
      })

      // Update roles if provided
      if (roleIds !== undefined) {
        const roles = await Role.findAll({ where: { id: roleIds } })
        await user.setRoles(roles)
      }

      // Get updated user with roles
      const updatedUser = await User.findByPk(id, {
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        }],
        attributes: { exclude: ['password'] }
      })

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      })
    } catch (error) {
      console.error('Update user error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Prevent deletion of the last admin user
      const adminRole = await Role.findOne({ where: { name: 'Administrator' } })
      if (adminRole) {
        const adminUsers = await User.findAll({
          include: [{
            model: Role,
            as: 'roles',
            where: { id: adminRole.id }
          }]
        })

        if (adminUsers.length === 1 && adminUsers[0].id === parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the last administrator user'
          })
        }
      }

      await user.destroy()

      res.json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      console.error('Delete user error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  // Change user password
  async changePassword(req, res) {
    try {
      const { id } = req.params
      const { currentPassword, newPassword } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Verify current password (skip for admins changing other users' passwords)
      if (req.user.id !== parseInt(id)) {
        const hasAdminRole = req.user.roles.some(role => role.name === 'Administrator')
        if (!hasAdminRole) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          })
        }
      } else {
        // User changing their own password
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required'
          })
        }

        const isValidPassword = await user.checkPassword(currentPassword)
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          })
        }
      }

      // Update password
      await user.update({ password: newPassword })

      res.json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      console.error('Change password error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

module.exports = new UserManagementController()