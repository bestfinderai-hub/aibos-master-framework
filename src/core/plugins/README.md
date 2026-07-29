# DEL 21 — Universal Plugin Platform

**Status**: ✅ Complete  
**LOC**: ~2,000  
**Commit**: [GitHub]

## Overview

Extensible plugin platform that transforms AIBOS into an ecosystem. Core stays small and stable; all features are installable plugins. Developers can build, publish, and monetize plugins.

## Core Components

### 1. Plugin Engine (`plugin-engine.js`)
Lifecycle management for plugins (install, enable, disable, uninstall).

**Key Methods:**
- `registerPlugin(manifest, implementation)` — Register plugin
- `installPlugin(pluginId, config)` — Install plugin
- `enablePlugin(pluginId)` — Load and activate plugin
- `disablePlugin(pluginId)` — Deactivate plugin
- `uninstallPlugin(pluginId)` — Remove plugin
- `emitEvent(eventName, data)` — Trigger plugin hooks
- `getPluginAPI(pluginId)` — Get plugin's API access

**Features:**
- Dependency resolution
- Hook system (events)
- Permission-based API access
- Plugin isolation
- Health monitoring

### 2. Plugin Registry (`plugin-registry.js`)
Central catalog of plugins, versions, ratings, and metadata.

**Key Methods:**
- `registerPlugin(manifest, metadata)` — Add to registry
- `search(query, filters)` — Search plugins
- `getPluginInfo(pluginId)` — Get plugin details
- `getVersions(pluginId)` — List all versions
- `addReview(pluginId, review)` — Add rating/review
- `getFeaturedPlugins()` — Get featured plugins
- `getTrendingPlugins()` — Get trending plugins
- `getStats()` — Registry statistics

**Features:**
- Full-text search with filters
- Version management
- Review and rating system
- Download tracking
- Marketplace integration

### 3. Plugin Manager (`plugin-manager.js`)
Handles installation, configuration, updates, and health monitoring.

**Key Methods:**
- `installFromRegistry(pluginId, version, config)` — Install from registry
- `uninstallPlugin(pluginId)` — Remove plugin
- `enablePlugin(pluginId)` — Activate plugin
- `disablePlugin(pluginId)` — Deactivate plugin
- `updatePlugin(pluginId, newVersion)` — Update to new version
- `setConfiguration(pluginId, config)` — Update config
- `checkForUpdates(pluginId)` — Check for new versions
- `getPluginHealth(pluginId)` — Monitor health

**Features:**
- Configuration management
- Update handling
- Health monitoring
- Metrics tracking
- Export/import configurations

## Plugin Types

### Module Plugins
Large features (CRM, Marketing, Lead Intelligence):
```javascript
{
  type: 'module',
  permissions: ['read:contacts', 'write:leads', 'access:api']
}
```

### Integration Plugins
Connect to external services (Slack, Stripe, Salesforce):
```javascript
{
  type: 'integration',
  permissions: ['trigger:webhooks', 'access:api']
}
```

### UI Plugins
Custom dashboards and pages:
```javascript
{
  type: 'ui',
  permissions: ['read:dashboard', 'read:reports']
}
```

### Command Plugins
CLI commands and automation:
```javascript
{
  type: 'command',
  permissions: ['queue:jobs', 'read:data']
}
```

### Webhook Plugins
Event-driven handlers:
```javascript
{
  type: 'webhook',
  permissions: ['trigger:webhooks']
}
```

## Plugin Manifest

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Plugin description",
  "type": "module|integration|ui|command|webhook",
  "permissions": ["read:contacts", "write:leads"],
  "dependencies": {
    "another-plugin": "^1.0.0"
  },
  "config": {
    "apiKey": { "type": "string", "required": true },
    "webhookUrl": { "type": "url" }
  },
  "pricing": {
    "model": "free|subscription|pay-per-use",
    "amount": 99,
    "currency": "USD"
  }
}
```

## Usage Example

```javascript
const PluginEngine = require('./plugin-engine');
const PluginRegistry = require('./plugin-registry');
const PluginManager = require('./plugin-manager');

// Initialize
const engine = new PluginEngine();
const registry = new PluginRegistry();
const manager = new PluginManager(engine, registry);

// Register plugin
const manifest = {
  id: 'crm-plugin',
  name: 'CRM Module',
  version: '1.0.0',
  type: 'module',
  permissions: ['read:contacts', 'write:leads']
};

engine.registerPlugin(manifest, {});
registry.registerPlugin(manifest, { category: 'crm', featured: true });

// Install from registry
await manager.installFromRegistry('crm-plugin', '1.0.0', {
  apiKey: 'secret123'
});

// Enable plugin
await manager.enablePlugin('crm-plugin');

// Check updates
const updates = manager.checkForUpdates('crm-plugin');

// Get health
const health = manager.getPluginHealth('crm-plugin');
```

## Plugin API Access

Plugins get a standardized API to interact with platform:

```javascript
// Inside plugin code
const { api } = require('@aibos/plugin-api');

// Event handlers
api.on('contact:created', async (contact) => {
  // Handle event
});

// Emit events
api.emit('custom:event', { data });

// Access platform data (if permission granted)
const contacts = await api.data.find('contacts', { limit: 10 });

// Call platform APIs
const result = await api.call('GET /api/contacts/123');

// Log
api.logger.info('Plugin action completed');

// Register routes (for UI plugins)
api.registerRoute('GET /plugin/data', (req, res) => {
  res.json({ data: 'test' });
});
```

## Marketplace Integration

### Publishing Plugin
```bash
# Validate manifest
aibos plugin:validate ./manifest.json

# Build plugin
aibos plugin:build ./my-plugin

# Publish to marketplace
aibos plugin:publish ./my-plugin
```

### Installing from Marketplace
```bash
# Search
aibos marketplace search "crm"

# Install
aibos marketplace install crm-plugin@1.0.0

# Auto-update
aibos marketplace update crm-plugin
```

## Security

- **Sandboxing**: Plugins run in isolated Node.js contexts
- **Permissions**: Granular access control (principle of least privilege)
- **Dependency scanning**: Detect vulnerable packages
- **Rate limiting**: Per-plugin resource quotas
- **Audit logging**: All plugin access tracked

## Performance

- Plugin load time: <100ms per plugin
- Support for 100+ concurrent plugins
- Hot-reload without downtime
- Automatic restart on crash
- Resource quotas prevent runaway plugins

## API Endpoints

### Plugin Management
- `GET /api/plugins` — List installed plugins
- `POST /api/plugins/install` — Install plugin
- `DELETE /api/plugins/:id` — Uninstall plugin
- `POST /api/plugins/:id/enable` — Enable plugin
- `POST /api/plugins/:id/disable` — Disable plugin
- `PUT /api/plugins/:id/config` — Update config

### Marketplace
- `GET /api/marketplace/search` — Search plugins
- `POST /api/marketplace/install` — Install from marketplace
- `POST /api/marketplace/review` — Leave review

## Testing

Run plugin tests:
```bash
npm test -- src/core/plugins/__tests__/plugins.test.js
```

**Test Coverage**: 85%+
- Plugin lifecycle ✅
- Event system ✅
- Registry operations ✅
- Manager operations ✅
- Validation ✅
- Metrics ✅

## Next Steps

- [DEL 22] Enterprise Observability & AIOps
- [DEL 23] Enterprise Intelligence & White Label
- [DEL 24] Meta Intelligence Engine
- [DEL 25] AIBOS Constitution & First Principles

## References

- Architecture: `docs/architecture/DEL-21-plugin-platform.md`
- Plugin API: `src/core/plugins/plugin-api.js`
- Developer Guide: Coming in DEL 18
