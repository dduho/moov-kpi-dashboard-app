const { sequelize, User, Role, Permission } = require('../models')

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Sync database
    await sequelize.sync({ force: true })
    console.log('✅ Database synchronized')

    // Create permissions
    const permissions = [
      // Dashboard permissions
      { name: 'View Dashboard', resource: 'dashboard', action: 'read', description: 'Can view dashboard' },
      { name: 'Export Dashboard Data', resource: 'dashboard', action: 'export', description: 'Can export dashboard data' },

      // KPI permissions
      { name: 'View KPIs', resource: 'kpis', action: 'read', description: 'Can view KPI data' },
      { name: 'Manage KPIs', resource: 'kpis', action: 'manage', description: 'Can manage KPI configurations' },

      // User management permissions
      { name: 'View Users', resource: 'users', action: 'read', description: 'Can view user list' },
      { name: 'Create Users', resource: 'users', action: 'create', description: 'Can create new users' },
      { name: 'Update Users', resource: 'users', action: 'update', description: 'Can update user information' },
      { name: 'Delete Users', resource: 'users', action: 'delete', description: 'Can delete users' },

      // Role management permissions
      { name: 'View Roles', resource: 'roles', action: 'read', description: 'Can view roles' },
      { name: 'Create Roles', resource: 'roles', action: 'create', description: 'Can create new roles' },
      { name: 'Update Roles', resource: 'roles', action: 'update', description: 'Can update roles' },
      { name: 'Delete Roles', resource: 'roles', action: 'delete', description: 'Can delete roles' },
      { name: 'Manage Role Permissions', resource: 'roles', action: 'manage_permissions', description: 'Can assign permissions to roles' },

      // Permission management permissions
      { name: 'View Permissions', resource: 'permissions', action: 'read', description: 'Can view permissions' },
      { name: 'Create Permissions', resource: 'permissions', action: 'create', description: 'Can create new permissions' },
      { name: 'Update Permissions', resource: 'permissions', action: 'update', description: 'Can update permissions' },
      { name: 'Delete Permissions', resource: 'permissions', action: 'delete', description: 'Can delete permissions' },

      // Data export permissions
      { name: 'Export Data', resource: 'export', action: 'create', description: 'Can export data' },

      // System permissions
      { name: 'System Administration', resource: 'system', action: 'admin', description: 'Full system access' }
    ]

    const createdPermissions = await Permission.bulkCreate(permissions)
    console.log(`✅ Created ${createdPermissions.length} permissions`)

    // Create roles
    const roles = [
      {
        name: 'Administrator',
        description: 'Full system access with all permissions',
        isSystemRole: true
      },
      {
        name: 'Manager',
        description: 'Management access with most permissions',
        isSystemRole: false
      },
      {
        name: 'Analyst',
        description: 'Read-only access to analytics and reports',
        isSystemRole: false
      },
      {
        name: 'User',
        description: 'Basic user access',
        isSystemRole: false
      }
    ]

    const createdRoles = await Role.bulkCreate(roles)
    console.log(`✅ Created ${createdRoles.length} roles`)

    // Assign permissions to roles
    const adminRole = createdRoles.find(r => r.name === 'Administrator')
    const managerRole = createdRoles.find(r => r.name === 'Manager')
    const analystRole = createdRoles.find(r => r.name === 'Analyst')
    const userRole = createdRoles.find(r => r.name === 'User')

    // Administrator gets all permissions
    await adminRole.setPermissions(createdPermissions)

    // Manager gets most permissions except system admin and user/role management
    const managerPermissions = createdPermissions.filter(p =>
      !['users', 'roles', 'permissions', 'system'].includes(p.resource) ||
      p.action === 'read'
    )
    await managerRole.setPermissions(managerPermissions)

    // Analyst gets read-only permissions
    const analystPermissions = createdPermissions.filter(p =>
      p.action === 'read' || p.resource === 'export'
    )
    await analystRole.setPermissions(analystPermissions)

    // User gets basic permissions
    const userPermissions = createdPermissions.filter(p =>
      p.resource === 'dashboard' && p.action === 'read'
    )
    await userRole.setPermissions(userPermissions)

    console.log('✅ Assigned permissions to roles')

    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@moov.com',
      password: 'p@ssw0rd',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true
    })

    // Assign admin role to admin user
    await adminUser.setRoles([adminRole])

    console.log('✅ Created default admin user')
    console.log('   Username: admin')
    console.log('   Password: p@ssw0rd')
    console.log('   Email: admin@moov.com')

    console.log('🎉 Database seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase