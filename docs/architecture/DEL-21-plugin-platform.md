# DEL 21 — Universal Plugin Platform Architecture

**Status**: Implementation  
**Estimated LOC**: ~2,000  
**Estimated Time**: 5-6 hours  

## Vision

AIBOS core platform stays **small & stable**. All features and integrations are **installable plugins**. Platform becomes extensible ecosystem where developers can build, share, and monetize plugins.

## Architecture Overview

### Core Components

1. **Plugin Engine** (`plugin-engine.js`)
   - Plugin discovery and registration
   - Lifecycle management (install, enable, disable, uninstall)
   - Dependency resolution
   - Plugin isolation and sandboxing
   - Event system for plugin communication

2. **Plugin Registry** (`plugin-registry.js`)
   - Central catalog of available plugins
   - Version management
   - Compatibility tracking
   - Metadata storage
   - Plugin search and discovery

3. **Plugin Manager** (`plugin-manager.js`)
   - Install/uninstall operations
   - Enable/disable toggles
   - Plugin updates
   - Configuration management
   - Health monitoring

4. **Plugin API** (`plugin-api.js`)
   - Standardized API for plugins
   - Access to core platform services
   - Event hooks and middleware
   - Secure method exposure

5. **Marketplace Integration** (`marketplace.js`)
   - Plugin discovery from marketplace
   - Installation from repository
   - Review ratings and feedback
   - Revenue sharing calculations

## Plugin Architecture

### Plugin Structure
```
my-plugin/
├── manifest.json          # Plugin metadata
├── package.json           # NPM package definition
├── src/
│   ├── index.js          # Plugin entry point
│   ├── commands.js       # CLI commands
│   ├── webhooks.js       # Webhook handlers
│   └── ui/              # UI components (if web plugin)
├── tests/
│   └── plugin.test.js    # Plugin tests
└── README.md             # Documentation
```

### Manifest Schema
```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "author": "Author Name",
  "description": "Plugin description",
  "type": "module|integration|ui|command",
  "targetVersion": ">=2.0.0",
  "permissions": ["read:contacts", "write:leads", "read:settings"],
  "dependencies": {
    "plugin-id-2": "^1.0.0"
  },
  "hooks": {
    "onInstall": "src/hooks.js",
    "onEnable": "src/hooks.js",
    "onUpdate": "src/hooks.js"
  },
  "config": {
    "apiKey": { "type": "string", "required": true },
    "webhookUrl": { "type": "url", "required": false }
  },
  "pricing": {
    "model": "free|subscription|pay-per-use",
    "amount": 99,
    "currency": "USD",
    "recurring": true
  }
}
```

## Plugin Types

### 1. Module Plugins
Large features installable as plugins:
- Lead Intelligence module
- CRM module
- Marketing Intelligence module
- Automation Engine
- Data Platform

**Capabilities**: Full database access, API endpoints, background jobs

### 2. Integration Plugins
Connect to external services:
- Salesforce, HubSpot, Pipedrive
- Slack, Microsoft Teams
- Stripe, Braintree
- Zapier, Integromat
- Google Workspace, Microsoft 365

**Capabilities**: OAuth, webhooks, data sync, bidirectional sync

### 3. UI Plugins
Visual components and pages:
- Custom dashboards
- Reports and analytics
- Workflow builders
- Data visualizations

**Capabilities**: React components, custom routes, theme customization

### 4. Command Plugins
CLI commands and automation:
- Custom workflows
- Data migrations
- Batch operations
- Administrative tasks

**Capabilities**: Access to CLI, background job queues, data access

### 5. Webhook Plugins
Event-driven handlers:
- Trigger-based automation
- Real-time event processing
- Data transformations
- Third-party notifications

**Capabilities**: Event filtering, transformation, conditional logic

## Plugin Lifecycle

```
[Discovery] → [Install] → [Configure] → [Enable] → [Active]
                ↓          ↓            ↓         ↓
            Validate   Setup Config  Load Code  Monitor
                ↓          ↓            ↓         ↓
              Check      Store       Register   Watch
            Manifest    Config      Hooks      Health
                ↑
            [Update] ← [Disable] ← [Error]
            Versioning  Unload      Fallback
                ↑
            [Uninstall]
            Cleanup
```

### Installation Flow
1. **Discovery** — Find plugin in marketplace or registry
2. **Validation** — Verify manifest, check dependencies, scan for security issues
3. **Installation** — Download, extract, install dependencies
4. **Configuration** — Initialize with required settings
5. **Activation** — Load code, register hooks, start monitoring

### Update Flow
1. **Check** — Compare versions, backward compatibility
2. **Backup** — Save current configuration
3. **Install** — Download new version
4. **Migrate** — Run migration hooks if needed
5. **Test** — Verify functionality before enabling
6. **Rollback** — Restore previous version on failure

## Permission System

Plugin permissions (principle of least privilege):

**Core**
- `read:settings` — Read platform settings
- `write:settings` — Modify settings
- `manage:plugins` — Install/enable/disable plugins

**Data Access**
- `read:contacts` — Read contact data
- `write:contacts` — Modify contacts
- `read:leads` — Read lead data
- `write:leads` — Modify leads
- `read:reports` — Read reports
- `write:reports` — Create reports

**Integration**
- `trigger:webhooks` — Trigger webhooks
- `access:api` — Call platform APIs
- `queue:jobs` — Queue background jobs
- `access:database` — Direct DB access (dangerous)

## Plugin API

### Core API
```javascript
// Access platform services
const { data, auth, api, logger } = require('@aibos/plugin-api');

// Register hooks
AIBOS.onEvent('contact:created', async (contact) => {
  // Handle event
});

// Register API endpoint
AIBOS.registerRoute('GET /plugin/data', (req, res) => {
  // Handle request
});

// Access platform data
const contacts = await AIBOS.data.find('contacts', { limit: 100 });

// Log events
AIBOS.logger.info('Plugin action completed');
```

### Event System
```javascript
// Available events
- 'app:start'
- 'app:stop'
- 'plugin:install'
- 'plugin:enable'
- 'plugin:disable'
- 'plugin:update'
- 'contact:created'
- 'contact:updated'
- 'contact:deleted'
- 'lead:created'
- 'lead:scored'
- 'order:completed'
- Custom events: 'custom:event-name'
```

## Plugin Registry & Marketplace

### Registry Structure
```
{
  "pluginId": {
    "id": "plugin-id",
    "name": "Plugin Name",
    "versions": {
      "1.0.0": { manifest, hash, downloads, rating },
      "1.0.1": { ... },
      "2.0.0": { ... }
    },
    "rating": 4.7,
    "reviews": 245,
    "downloads": 5000,
    "author": "author-id",
    "featured": true,
    "category": "integration|module|ui|command",
    "tags": ["crm", "sales", "automation"],
    "pricing": { model, amount, ... },
    "repository": "https://github.com/...",
    "documentation": "https://docs...",
    "support": "https://support..."
  }
}
```

### Marketplace Features
- Search by name, category, tags
- Filter by rating, downloads, price
- Display reviews and ratings
- One-click install from marketplace
- Automatic updates
- Revenue sharing (70/30 split)
- Plugin monetization options

## Security Model

### Plugin Sandboxing
- Plugins run in isolated Node.js VM contexts
- Limited access to system resources
- Network request monitoring
- File system access restrictions
- Database query limits

### Code Security
- Manifest validation
- Dependency scanning (vulnerable packages)
- Code review before marketplace listing
- Rate limiting per plugin
- Resource quotas (CPU, memory, API calls)

### Data Protection
- Granular permission system
- Audit logging of plugin access
- Encryption for sensitive operations
- PII masking options
- Data export restrictions

## API Endpoints

### Plugin Management
- `GET /api/plugins` — List installed plugins
- `GET /api/plugins/:id` — Get plugin details
- `POST /api/plugins/install` — Install plugin
- `POST /api/plugins/:id/enable` — Enable plugin
- `POST /api/plugins/:id/disable` — Disable plugin
- `DELETE /api/plugins/:id` — Uninstall plugin
- `PUT /api/plugins/:id/config` — Update plugin config
- `GET /api/plugins/:id/logs` — Get plugin logs

### Marketplace
- `GET /api/marketplace/plugins` — Search marketplace
- `GET /api/marketplace/plugins/:id` — Get plugin details
- `POST /api/marketplace/plugins/:id/install` — Install from marketplace
- `POST /api/marketplace/plugins/:id/review` — Leave review
- `GET /api/marketplace/featured` — Get featured plugins

### Plugin Development
- `POST /api/plugins/validate` — Validate plugin manifest
- `POST /api/plugins/test` — Run plugin tests
- `POST /api/plugins/publish` — Publish to marketplace
- `GET /api/plugins/docs` — Plugin API documentation

## Performance & Reliability

### Plugin Performance
- Plugin load time: <100ms per plugin
- Plugin health check: Every 5 minutes
- Automatic restart on crash
- Plugin isolation prevents cascade failures
- Resource quotas prevent runaway plugins

### Plugin Management
- Up to 100+ plugins supported
- Plugin update without downtime (hot reload)
- Automatic rollback on update failure
- Dependency resolution prevents conflicts
- Version compatibility checking

## Developer Tools

### Plugin SDK
- TypeScript definitions
- CLI for scaffolding plugins
- Local development server
- Plugin testing framework
- Documentation generator

### CLI Commands
```bash
# Create new plugin
aibos plugin:create my-plugin

# Develop locally
aibos plugin:dev ./my-plugin

# Test plugin
aibos plugin:test ./my-plugin

# Build plugin
aibos plugin:build ./my-plugin

# Publish to marketplace
aibos plugin:publish ./my-plugin

# Validate manifest
aibos plugin:validate ./my-plugin/manifest.json
```

## Testing Strategy

- Unit tests for plugin logic
- Integration tests with plugin API
- Sandbox security tests
- Performance/load tests
- Compatibility matrix tests
- Marketplace certification tests

## References

- Architecture: `docs/architecture/DEL-21-plugin-platform.md`
- Plugin API: `src/core/plugins/plugin-api.js`
- Developer Guide: `docs/development/PLUGIN_GUIDE.md`
- Examples: `examples/plugins/`

