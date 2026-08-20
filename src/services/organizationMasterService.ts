import { 
  MasterOrganizationNode, 
  OrganizationHierarchyTreeNode, 
  OrganizationRelationship, 
  OrganizationVersionRecord, 
  OrganizationMasterAnalytics,
  OrganizationStatus
} from '../types/organizationMaster';
import { OrganizationMasterRepository } from '../db/repositories/organizationMasterRepository';
import { AuditService } from './auditService';
import { EventBusService } from './eventBusService';

export class OrganizationMasterService {
  /**
   * Get all organization nodes with optional filters
   */
  public static async getAllNodes(filter?: {
    type?: string;
    status?: string;
    search?: string;
    country?: string;
  }): Promise<MasterOrganizationNode[]> {
    let nodes = await OrganizationMasterRepository.getNodes();

    if (filter?.type) {
      nodes = nodes.filter(n => n.type === filter.type);
    }
    if (filter?.status) {
      nodes = nodes.filter(n => n.status === filter.status);
    }
    if (filter?.country) {
      nodes = nodes.filter(n => n.geographic.country === filter.country);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      nodes = nodes.filter(
        n =>
          n.name.toLowerCase().includes(q) ||
          n.nameAr.includes(q) ||
          n.code.toLowerCase().includes(q) ||
          n.shortName.toLowerCase().includes(q)
      );
    }

    return nodes;
  }

  /**
   * Get node by ID
   */
  public static async getNodeById(id: string): Promise<MasterOrganizationNode | null> {
    return OrganizationMasterRepository.getNodeById(id);
  }

  /**
   * Build complete unlimited-depth hierarchy tree
   */
  public static async getHierarchyTree(rootId?: string): Promise<OrganizationHierarchyTreeNode[]> {
    const nodes = await OrganizationMasterRepository.getNodes();

    const nodeMap = new Map<string, OrganizationHierarchyTreeNode>();
    nodes.forEach(n => {
      nodeMap.set(n.id, {
        node: n,
        children: [],
        totalSubNodes: 0
      });
    });

    const roots: OrganizationHierarchyTreeNode[] = [];

    nodes.forEach(n => {
      const treeNode = nodeMap.get(n.id)!;
      if (n.parentId && nodeMap.has(n.parentId)) {
        nodeMap.get(n.parentId)!.children.push(treeNode);
      } else {
        roots.push(treeNode);
      }
    });

    // Helper to calculate total subnodes recursively
    const countSubNodes = (item: OrganizationHierarchyTreeNode): number => {
      let count = item.children.length;
      for (const child of item.children) {
        count += countSubNodes(child);
      }
      item.totalSubNodes = count;
      return count;
    };

    roots.forEach(r => countSubNodes(r));

    if (rootId && nodeMap.has(rootId)) {
      return [nodeMap.get(rootId)!];
    }

    return roots;
  }

  /**
   * Calculate lineage path and depth for a node based on parent
   */
  private static async buildLineageAndDepth(
    parentId: string | null,
    nodeId: string
  ): Promise<{ lineagePath: string; depth: number }> {
    if (!parentId) {
      return { lineagePath: `/${nodeId}`, depth: 0 };
    }

    const parent = await OrganizationMasterRepository.getNodeById(parentId);
    if (!parent) {
      return { lineagePath: `/${nodeId}`, depth: 0 };
    }

    return {
      lineagePath: `${parent.lineagePath}/${nodeId}`,
      depth: parent.depth + 1
    };
  }

  /**
   * Create or Register a new Organization Node
   */
  public static async createNode(
    payload: Omit<MasterOrganizationNode, 'id' | 'depth' | 'lineagePath' | 'version' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    },
    userId: string = 'sys-admin'
  ): Promise<MasterOrganizationNode> {
    const nodeId = payload.id || `org-${payload.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const { lineagePath, depth } = await this.buildLineageAndDepth(payload.parentId, nodeId);

    const newNode: MasterOrganizationNode = {
      ...payload,
      id: nodeId,
      depth,
      lineagePath,
      version: 1,
      effectiveDate: payload.effectiveDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await OrganizationMasterRepository.saveNode(newNode);

    // Record audit log
    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'OrganizationNode',
      entityId: newNode.id,
      severity: 'INFO',
      description: `Created Organization Master Node [${newNode.code}] - ${newNode.name}`,
      newState: {
        code: newNode.code,
        name: newNode.name,
        type: newNode.type,
        parentId: newNode.parentId,
        depth: newNode.depth
      }
    });

    // Publish event
    await EventBusService.publish({
      name: 'OrganizationNodeCreated',
      aggregateId: newNode.id,
      aggregateType: 'OrganizationNode',
      module: 'ORGANIZATION' as any,
      priority: 'NORMAL',
      payload: { orgNodeId: newNode.id, code: newNode.code, type: newNode.type }
    });

    return newNode;
  }

  /**
   * Update an existing Organization Node with versioning
   */
  public static async updateNode(
    id: string,
    updates: Partial<MasterOrganizationNode>,
    userId: string = 'sys-admin',
    reason?: string
  ): Promise<MasterOrganizationNode> {
    const existing = await OrganizationMasterRepository.getNodeById(id);
    if (!existing) {
      throw new Error(`Organization node with ID ${id} not found.`);
    }

    // Detect structural parent change
    let depth = existing.depth;
    let lineagePath = existing.lineagePath;

    if (updates.parentId !== undefined && updates.parentId !== existing.parentId) {
      // Validate circular hierarchy
      if (updates.parentId === id) {
        throw new Error('Node cannot be its own parent.');
      }
      if (updates.parentId) {
        const targetParent = await OrganizationMasterRepository.getNodeById(updates.parentId);
        if (targetParent && targetParent.lineagePath.includes(id)) {
          throw new Error('Cannot assign a descendant as a parent (circular dependency).');
        }
      }

      const calculated = await this.buildLineageAndDepth(updates.parentId, id);
      lineagePath = calculated.lineagePath;
      depth = calculated.depth;
    }

    const diffs: Record<string, { oldVal: any; newVal: any }> = {};
    Object.keys(updates).forEach(key => {
      const k = key as keyof MasterOrganizationNode;
      if (JSON.stringify(existing[k]) !== JSON.stringify(updates[k])) {
        diffs[key] = { oldVal: existing[k], newVal: updates[k] };
      }
    });

    const newVersion = existing.version + 1;

    const updatedNode: MasterOrganizationNode = {
      ...existing,
      ...updates,
      depth,
      lineagePath,
      version: newVersion,
      updatedAt: new Date().toISOString()
    };

    await OrganizationMasterRepository.saveNode(updatedNode);

    // Save version entry
    const versionRecord: OrganizationVersionRecord = {
      versionId: `ver-${id}-v${newVersion}`,
      orgId: id,
      version: newVersion,
      effectiveDate: updatedNode.effectiveDate || new Date().toISOString().split('T')[0],
      changes: diffs,
      changedBy: userId,
      timestamp: new Date().toISOString(),
      reason: reason || 'Master Data Record Updated'
    };

    await OrganizationMasterRepository.saveVersion(versionRecord);

    // Log Audit
    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'OrganizationNode',
      entityId: id,
      severity: 'INFO',
      description: `Updated Organization Master Node v${newVersion} [${id}] - ${reason || 'Updates Applied'}`,
      newState: { version: newVersion, diffs }
    });

    // Publish Event
    await EventBusService.publish({
      name: 'OrganizationNodeUpdated',
      aggregateId: id,
      aggregateType: 'OrganizationNode',
      module: 'ORGANIZATION' as any,
      priority: 'NORMAL',
      payload: { orgNodeId: id, version: newVersion, changesCount: Object.keys(diffs).length }
    });

    return updatedNode;
  }

  /**
   * Move node in hierarchy safely
   */
  public static async moveNodeInHierarchy(
    nodeId: string,
    newParentId: string | null,
    userId: string = 'sys-admin'
  ): Promise<MasterOrganizationNode> {
    return this.updateNode(
      nodeId,
      { parentId: newParentId },
      userId,
      `Reassigned parent to ${newParentId || 'ROOT'}`
    );
  }

  /**
   * Soft delete or update status
   */
  public static async setNodeStatus(
    id: string,
    status: OrganizationStatus,
    userId: string = 'sys-admin'
  ): Promise<MasterOrganizationNode> {
    return this.updateNode(id, { status }, userId, `Status updated to ${status}`);
  }

  /**
   * Delete node
   */
  public static async deleteNode(id: string, userId: string = 'sys-admin'): Promise<boolean> {
    const existing = await OrganizationMasterRepository.getNodeById(id);
    if (!existing) return false;

    const success = await OrganizationMasterRepository.deleteNode(id);
    if (success) {
      await AuditService.logAudit({
        actorId: userId,
        actorEmail: `${userId}@aja-logistics.com`,
        action: 'WORKFLOW_CHANGE',
        module: 'MDM',
        entityType: 'OrganizationNode',
        entityId: id,
        severity: 'CRITICAL',
        description: `Deleted Organization Master Node [${existing.code}] - ${existing.name}`
      });

      await EventBusService.publish({
        name: 'OrganizationNodeDeleted',
        aggregateId: id,
        aggregateType: 'OrganizationNode',
        module: 'ORGANIZATION' as any,
        priority: 'HIGH',
        payload: { orgNodeId: id, code: existing.code }
      });
    }

    return success;
  }

  /**
   * Manage Relationships
   */
  public static async getRelationships(): Promise<OrganizationRelationship[]> {
    return OrganizationMasterRepository.getRelationships();
  }

  public static async createRelationship(
    payload: Omit<OrganizationRelationship, 'id' | 'createdAt'>,
    userId: string = 'sys-admin'
  ): Promise<OrganizationRelationship> {
    const rel: OrganizationRelationship = {
      ...payload,
      id: `rel-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    await OrganizationMasterRepository.saveRelationship(rel);

    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'OrganizationRelationship',
      entityId: rel.id,
      severity: 'INFO',
      description: `Created Cross-Entity Relationship: ${rel.sourceOrgName} -> ${rel.targetOrgName} (${rel.relationshipType})`
    });

    return rel;
  }

  /**
   * Get node versions
   */
  public static async getNodeVersions(id: string): Promise<OrganizationVersionRecord[]> {
    return OrganizationMasterRepository.getVersions(id);
  }

  /**
   * Calculate Analytics KPI Overview
   */
  public static async getAnalytics(): Promise<OrganizationMasterAnalytics> {
    const nodes = await OrganizationMasterRepository.getNodes();

    const nodesByType: Record<string, number> = {};
    let activeCount = 0;
    let inactiveCount = 0;
    let maxDepth = 0;
    let legalEntityCount = 0;
    let costCenterCount = 0;
    let profitCenterCount = 0;

    nodes.forEach(n => {
      nodesByType[n.type] = (nodesByType[n.type] || 0) + 1;
      if (n.status === 'ACTIVE') activeCount++;
      else inactiveCount++;

      if (n.depth > maxDepth) maxDepth = n.depth;
      if (n.legalEntity?.commercialRegistration) legalEntityCount++;
      if (n.financial?.costCenterId) costCenterCount++;
      if (n.financial?.profitCenterId) profitCenterCount++;
    });

    return {
      totalNodes: nodes.length,
      nodesByType,
      totalLegalEntities: legalEntityCount,
      totalCostCenters: costCenterCount,
      totalProfitCenters: profitCenterCount,
      maxHierarchyDepth: maxDepth,
      activeCount,
      inactiveCount
    };
  }
}
