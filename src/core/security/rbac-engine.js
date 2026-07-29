/**
 * RBAC Engine
 * Role-based access control with permissions and resource policies
 */

class RBACEngine {
  constructor() {
    this.roles = this.initializeRoles();
    this.userRoles = new Map(); // userId -> { role, tenantId }
    this.resourcePolicies = new Map(); // resourceId -> [{ userId, action }]
  }

  /**
   * Initialize default roles
   */
  initializeRoles() {
    return {
      admin: {
        name: 'Administrator',
        permissions: [
          'read:*',
          'write:*',
          'delete:*',
          'manage:users',
          'manage:roles',
          'view:audit',
          'manage:settings'
        ],
        level: 100
      },
      manager: {
        name: 'Manager',
        permissions: [
          'read:dashboard',
          'write:dashboard',
          'read:reports',
          'write:reports',
          'read:contacts',
          'write:contacts',
          'read:teams',
          'manage:team_members'
        ],
        level: 75
      },
      user: {
        name: 'User',
        permissions: [
          'read:dashboard',
          'read:contacts',
          'write:contacts',
          'read:reports',
          'read:own_profile',
          'write:own_profile'
        ],
        level: 50
      },
      guest: {
        name: 'Guest',
        permissions: [
          'read:public_reports',
          'read:shared_dashboards'
        ],
        level: 25
      }
    };
  }

  /**
   * Assign role to user
   */
  assignRole(userId, roleName, tenantId) {
    if (!this.roles[roleName]) {
      throw new Error(`Role '${roleName}' does not exist`);
    }

    this.userRoles.set(userId, { role: roleName, tenantId, assignedAt: new Date() });
    return true;
  }

  /**
   * Get user's role
   */
  getUserRole(userId) {
    return this.userRoles.get(userId);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId, permission) {
    const userRole = this.userRoles.get(userId);
    if (!userRole) return false;

    const role = this.roles[userRole.role];
    if (!role) return false;

    // Check exact match
    if (role.permissions.includes(permission)) return true;

    // Check wildcard match (e.g., 'read:*')
    const [action, resource] = permission.split(':');
    const wildcard = action + ':*';

    return role.permissions.includes(wildcard);
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(userId, permissions) {
    return permissions.every(p => this.hasPermission(userId, p));
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(userId, permissions) {
    return permissions.some(p => this.hasPermission(userId, p));
  }

  /**
   * Enforce permission (throw if denied)
   */
  enforcePermission(userId, permission) {
    if (!this.hasPermission(userId, permission)) {
      throw new Error(`User ${userId} denied permission: ${permission}`);
    }
  }

  /**
   * Get user's permissions
   */
  getPermissions(userId) {
    const userRole = this.userRoles.get(userId);
    if (!userRole) return [];

    const role = this.roles[userRole.role];
    return role ? role.permissions : [];
  }

  /**
   * Grant resource-level access
   */
  grantResourceAccess(userId, resourceId, actions) {
    if (!this.resourcePolicies.has(resourceId)) {
      this.resourcePolicies.set(resourceId, []);
    }

    const policies = this.resourcePolicies.get(resourceId);
    const existing = policies.find(p => p.userId === userId);

    if (existing) {
      existing.actions = Array.from(new Set([...existing.actions, ...actions]));
      existing.grantedAt = new Date();
    } else {
      policies.push({ userId, actions, grantedAt: new Date() });
    }

    return true;
  }

  /**
   * Revoke resource-level access
   */
  revokeResourceAccess(userId, resourceId, actions = null) {
    if (!this.resourcePolicies.has(resourceId)) return false;

    const policies = this.resourcePolicies.get(resourceId);
    const index = policies.findIndex(p => p.userId === userId);

    if (index === -1) return false;

    if (actions) {
      policies[index].actions = policies[index].actions.filter(a => !actions.includes(a));
      if (policies[index].actions.length === 0) {
        policies.splice(index, 1);
      }
    } else {
      policies.splice(index, 1);
    }

    return true;
  }

  /**
   * Check resource-level access
   */
  hasResourceAccess(userId, resourceId, action) {
    const userRole = this.userRoles.get(userId);
    if (!userRole) return false;

    // Admins always have access
    if (userRole.role === 'admin') return true;

    // Check resource-specific policy
    if (this.resourcePolicies.has(resourceId)) {
      const policies = this.resourcePolicies.get(resourceId);
      const policy = policies.find(p => p.userId === userId);

      if (policy && policy.actions.includes(action)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get tenant data for user (tenant isolation)
   */
  getTenantAccess(userId) {
    const userRole = this.userRoles.get(userId);
    return userRole ? userRole.tenantId : null;
  }

  /**
   * Create custom role
   */
  createCustomRole(roleName, permissions, level = 50) {
    if (this.roles[roleName]) {
      throw new Error(`Role '${roleName}' already exists`);
    }

    this.roles[roleName] = {
      name: roleName,
      permissions,
      level,
      isCustom: true,
      createdAt: new Date()
    };

    return this.roles[roleName];
  }

  /**
   * Update role permissions
   */
  updateRolePermissions(roleName, newPermissions) {
    if (!this.roles[roleName]) {
      throw new Error(`Role '${roleName}' does not exist`);
    }

    this.roles[roleName].permissions = newPermissions;
    this.roles[roleName].updatedAt = new Date();

    return this.roles[roleName];
  }

  /**
   * Delete role
   */
  deleteRole(roleName) {
    if (!this.roles[roleName]) {
      throw new Error(`Role '${roleName}' does not exist`);
    }

    if (!this.roles[roleName].isCustom) {
      throw new Error('Cannot delete built-in roles');
    }

    delete this.roles[roleName];
    return true;
  }

  /**
   * Get role info
   */
  getRole(roleName) {
    return this.roles[roleName] || null;
  }

  /**
   * List all roles
   */
  listRoles() {
    return Object.entries(this.roles).map(([name, role]) => ({
      name,
      ...role
    }));
  }

  /**
   * Audit access (for compliance)
   */
  auditAccess(userId, action, resource, allowed) {
    return {
      userId,
      action,
      resource,
      allowed,
      timestamp: new Date(),
      role: this.userRoles.get(userId)?.role
    };
  }

  /**
   * Bulk assign roles
   */
  bulkAssignRoles(assignments) {
    const results = [];

    for (const { userId, roleName, tenantId } of assignments) {
      try {
        this.assignRole(userId, roleName, tenantId);
        results.push({ userId, success: true });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get users by role
   */
  getUsersByRole(roleName) {
    const users = [];

    for (const [userId, userRole] of this.userRoles) {
      if (userRole.role === roleName) {
        users.push({ userId, ...userRole });
      }
    }

    return users;
  }
}

module.exports = RBACEngine;
