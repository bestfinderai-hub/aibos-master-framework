/**
 * System Knowledge Graph
 * Unified representation of all platform entities and relationships
 */

class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> node
    this.edges = new Map(); // id -> edge
    this.indices = {
      byType: new Map(),
      byLabel: new Map(),
      relationships: new Map()
    };
  }

  // ============================================================================
  // NODE MANAGEMENT
  // ============================================================================

  addNode(id, type, data) {
    if (this.nodes.has(id)) {
      throw new Error(`Node ${id} already exists`);
    }

    const node = {
      id,
      type,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
      relationships: []
    };

    this.nodes.set(id, node);

    // Index by type
    if (!this.indices.byType.has(type)) {
      this.indices.byType.set(type, []);
    }
    this.indices.byType.get(type).push(id);

    // Index by label (data.name or data.value)
    const label = data.name || data.label || id;
    if (!this.indices.byLabel.has(label)) {
      this.indices.byLabel.set(label, []);
    }
    this.indices.byLabel.get(label).push(id);

    return node;
  }

  updateNode(id, data) {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} not found`);
    }

    Object.assign(node.data, data);
    node.updatedAt = new Date();

    return node;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  removeNode(id) {
    const node = this.nodes.get(id);
    if (!node) return false;

    // Remove all edges connected to this node
    for (const relationship of node.relationships) {
      this.edges.delete(relationship.edgeId);
    }

    // Remove from indices
    const type = node.type;
    if (this.indices.byType.has(type)) {
      this.indices.byType.set(type, this.indices.byType.get(type).filter(nid => nid !== id));
    }

    this.nodes.delete(id);
    return true;
  }

  // ============================================================================
  // EDGE MANAGEMENT
  // ============================================================================

  addEdge(id, sourceId, targetId, relationship, weight = 1, metadata = {}) {
    if (!this.nodes.has(sourceId)) {
      throw new Error(`Source node ${sourceId} not found`);
    }
    if (!this.nodes.has(targetId)) {
      throw new Error(`Target node ${targetId} not found`);
    }

    const edge = {
      id,
      sourceId,
      targetId,
      relationship,
      weight,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.edges.set(id, edge);

    // Update node relationships
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);

    sourceNode.relationships.push({ edgeId: id, targetId, relationship });
    targetNode.relationships.push({ edgeId: id, sourceId, relationship });

    // Index by relationship type
    const relKey = `${sourceId}:${relationship}:${targetId}`;
    this.indices.relationships.set(relKey, id);

    return edge;
  }

  getEdge(id) {
    return this.edges.get(id);
  }

  removeEdge(id) {
    const edge = this.edges.get(id);
    if (!edge) return false;

    const sourceNode = this.nodes.get(edge.sourceId);
    const targetNode = this.nodes.get(edge.targetId);

    sourceNode.relationships = sourceNode.relationships.filter(r => r.edgeId !== id);
    targetNode.relationships = targetNode.relationships.filter(r => r.edgeId !== id);

    this.edges.delete(id);
    return true;
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  findNodesByType(type) {
    const ids = this.indices.byType.get(type) || [];
    return ids.map(id => this.nodes.get(id));
  }

  findNodesByLabel(label) {
    const ids = this.indices.byLabel.get(label) || [];
    return ids.map(id => this.nodes.get(id));
  }

  findConnectedNodes(nodeId, relationship = null, direction = 'both') {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const connected = [];

    for (const rel of node.relationships) {
      if (relationship && rel.relationship !== relationship) {
        continue;
      }

      // Handle direction filtering
      const edge = this.edges.get(rel.edgeId);
      if (direction === 'out' && edge.sourceId !== nodeId) continue;
      if (direction === 'in' && edge.targetId !== nodeId) continue;

      const connectedId = rel.targetId || rel.sourceId;
      connected.push({
        node: this.nodes.get(connectedId),
        relationship: rel.relationship,
        weight: edge.weight,
        metadata: edge.metadata
      });
    }

    return connected;
  }

  getShortestPath(sourceId, targetId, maxHops = 5) {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }

    if (sourceId === targetId) {
      return { path: [sourceId], distance: 0 };
    }

    const queue = [[sourceId]];
    const visited = new Set([sourceId]);
    let hops = 0;

    while (queue.length > 0 && hops < maxHops) {
      const levelSize = queue.length;

      for (let i = 0; i < levelSize; i++) {
        const currentPath = queue.shift();
        const currentNode = currentPath[currentPath.length - 1];

        const neighbors = this.findConnectedNodes(currentNode);

        for (const { node } of neighbors) {
          if (node.id === targetId) {
            return {
              path: [...currentPath, node.id],
              distance: currentPath.length
            };
          }

          if (!visited.has(node.id)) {
            visited.add(node.id);
            queue.push([...currentPath, node.id]);
          }
        }
      }

      hops++;
    }

    return null;
  }

  // ============================================================================
  // IMPACT ANALYSIS
  // ============================================================================

  analyzeImpact(nodeId, depth = 2) {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    const impact = {
      node: node,
      directImpact: [],
      indirectImpact: [],
      cascadeRisk: 0
    };

    // Direct impact (1 hop)
    const direct = this.findConnectedNodes(nodeId, null, 'out');
    impact.directImpact = direct.map(({ node: n, relationship: rel, weight }) => ({
      targetId: n.id,
      targetType: n.type,
      relationship: rel,
      weight,
      changeType: this.inferChangeType(node.type, n.type, rel)
    }));

    // Indirect impact (2 hops)
    if (depth > 1) {
      const visited = new Set([nodeId]);
      for (const { node: n1 } of direct) {
        visited.add(n1.id);
        const level2 = this.findConnectedNodes(n1.id, null, 'out');
        for (const { node: n2, relationship: rel } of level2) {
          if (!visited.has(n2.id)) {
            impact.indirectImpact.push({
              targetId: n2.id,
              targetType: n2.type,
              path: [nodeId, n1.id, n2.id],
              relationship: rel,
              depth: 2
            });
          }
        }
      }
    }

    // Calculate cascade risk (0-1) - direct calculation to avoid recursion
    const riskScore = (impact.directImpact.length * 0.3 + impact.indirectImpact.length * 0.15) / 10;
    impact.cascadeRisk = Math.min(riskScore, 1);

    return impact;
  }

  inferChangeType(sourceType, targetType, relationship) {
    if (relationship === 'drives') return 'positive';
    if (relationship === 'constrains') return 'negative';
    if (relationship === 'depends_on') return 'dependency';
    return 'unknown';
  }

  // ============================================================================
  // GRAPH ANALYSIS
  // ============================================================================

  getCentralityScores(limit = 10) {
    const scores = [];

    for (const [nodeId, node] of this.nodes.entries()) {
      const centrality = {
        nodeId,
        type: node.type,
        degree: node.relationships.length,
        inDegree: node.relationships.filter(r => this.edges.get(r.edgeId).targetId === nodeId).length,
        outDegree: node.relationships.filter(r => this.edges.get(r.edgeId).sourceId === nodeId).length
      };
      scores.push(centrality);
    }

    return scores
      .sort((a, b) => b.degree - a.degree)
      .slice(0, limit);
  }

  detectCycles(maxLength = 5) {
    const cycles = [];
    const visited = new Set();

    const dfs = (nodeId, path, pathSet) => {
      if (path.length > maxLength) return;

      const neighbors = this.findConnectedNodes(nodeId);

      for (const { node } of neighbors) {
        if (pathSet.has(node.id)) {
          if (path.length >= 3) {
            const cycleStart = path.indexOf(node.id);
            if (cycleStart !== -1) {
              const cycle = [...path.slice(cycleStart), node.id];
              const cycleKey = cycle.join(':');
              if (!visited.has(cycleKey)) {
                visited.add(cycleKey);
                cycles.push(cycle);
              }
            }
          }
        } else {
          dfs(node.id, [...path, node.id], new Set([...pathSet, node.id]));
        }
      }
    };

    for (const [nodeId] of this.nodes.entries()) {
      dfs(nodeId, [nodeId], new Set([nodeId]));
    }

    return cycles;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodesByType: Object.fromEntries(this.indices.byType),
      averageDegree: this.nodes.size > 0
        ? Array.from(this.nodes.values()).reduce((sum, n) => sum + n.relationships.length, 0) / this.nodes.size
        : 0,
      cycleCount: this.detectCycles().length,
      density: this.nodes.size > 1
        ? (this.edges.size * 2) / (this.nodes.size * (this.nodes.size - 1))
        : 0
    };
  }

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  export() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  import(data) {
    this.nodes.clear();
    this.edges.clear();
    this.indices = {
      byType: new Map(),
      byLabel: new Map(),
      relationships: new Map()
    };

    for (const node of data.nodes) {
      this.nodes.set(node.id, node);
      if (!this.indices.byType.has(node.type)) {
        this.indices.byType.set(node.type, []);
      }
      this.indices.byType.get(node.type).push(node.id);
    }

    for (const edge of data.edges) {
      this.edges.set(edge.id, edge);
      const relKey = `${edge.sourceId}:${edge.relationship}:${edge.targetId}`;
      this.indices.relationships.set(relKey, edge.id);
    }
  }
}

module.exports = KnowledgeGraph;
