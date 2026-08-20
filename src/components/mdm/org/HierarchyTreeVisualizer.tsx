import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  MoveRight, 
  Network, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  Edit3,
  RefreshCw,
  FolderTree,
  CornerDownRight
} from 'lucide-react';
import { OrganizationHierarchyTreeNode, MasterOrganizationNode } from '../../../types/organizationMaster';

interface HierarchyTreeVisualizerProps {
  onEditNode?: (node: MasterOrganizationNode) => void;
}

export const HierarchyTreeVisualizer: React.FC<HierarchyTreeVisualizerProps> = ({ onEditNode }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [treeData, setTreeData] = useState<OrganizationHierarchyTreeNode[]>([]);
  const [allNodes, setAllNodes] = useState<MasterOrganizationNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Reassign parent state
  const [movingNode, setMovingNode] = useState<MasterOrganizationNode | null>(null);
  const [selectedNewParentId, setSelectedNewParentId] = useState<string>('');
  const [isMoveSubmitting, setIsMoveSubmitting] = useState(false);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const [resTree, resNodes] = await Promise.all([
        fetch('/api/organization/master/hierarchy', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/organization/master/nodes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resTree.ok && resNodes.ok) {
        const tree = await resTree.json();
        const nodes = await resNodes.json();
        setTreeData(tree);
        setAllNodes(nodes);

        // Auto-expand root & first level
        const expanded: Record<string, boolean> = {};
        const expandRecursive = (items: OrganizationHierarchyTreeNode[]) => {
          items.forEach(i => {
            expanded[i.node.id] = true;
            if (i.children) expandRecursive(i.children);
          });
        };
        expandRecursive(tree);
        setExpandedNodes(expanded);
      }
    } catch (err) {
      console.error('[HierarchyTreeVisualizer] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleOpenMove = (node: MasterOrganizationNode) => {
    setMovingNode(node);
    setSelectedNewParentId(node.parentId || '');
  };

  const handleConfirmMove = async () => {
    if (!movingNode) return;
    setIsMoveSubmitting(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/organization/master/nodes/${movingNode.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newParentId: selectedNewParentId || null })
      });

      if (res.ok) {
        setMovingNode(null);
        fetchTree();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to move node');
      }
    } catch (err) {
      console.error('[MoveNode] Error:', err);
    } finally {
      setIsMoveSubmitting(false);
    }
  };

  const renderTreeNode = (item: OrganizationHierarchyTreeNode, depthLevel: number = 0) => {
    const { node, children, totalSubNodes } = item;
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = children && children.length > 0;

    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`group bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            depthLevel === 0
              ? 'border-amber-300 bg-amber-50/30'
              : depthLevel === 1
              ? 'border-sky-200'
              : 'border-slate-200'
          }`}
          style={{ marginLeft: isAr ? 0 : `${depthLevel * 24}px`, marginRight: isAr ? `${depthLevel * 24}px` : 0 }}
        >
          <div className="flex items-start gap-3 flex-1">
            {/* Expand / Collapse Icon */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition shrink-0 mt-0.5"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
              </button>
            ) : (
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <CornerDownRight className="w-4 h-4 text-slate-300 rtl:rotate-90" />
              </div>
            )}

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-mono">
                  {node.code}
                </span>
                <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                  {node.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isAr ? `العمق: ${node.depth}` : `Depth: ${node.depth}`}
                </span>
                {totalSubNodes > 0 && (
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                    {isAr ? `${totalSubNodes} كيان فرعي` : `${totalSubNodes} Sub-entities`}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {isAr ? node.nameAr : node.name}
              </h4>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {node.geographic.city}, {node.geographic.country}
                </span>
                {node.legalEntity?.commercialRegistration && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-amber-700">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    CR: {node.legalEntity.commercialRegistration}
                  </span>
                )}
                {node.financial?.costCenterCode && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    {node.financial.costCenterCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Node Actions */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => handleOpenMove(node)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <Network className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'نقل الهيكل' : 'Reassign Parent'}</span>
            </button>
            {onEditNode && (
              <button
                onClick={() => onEditNode(node)}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                title={isAr ? 'تعديل' : 'Edit'}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Render Children Recursively */}
        {hasChildren && isExpanded && (
          <div className="space-y-2 pt-1">
            {children.map(child => renderTreeNode(child, depthLevel + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'شجرة الهيكل التنظيمي للمؤسسة' : 'Unlimited-Depth Organization Hierarchy Tree'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'عرض هرمي تفاعلي لكافة الشركات القابضة، التابعة، الفروع، الأقسام، ووحدات الأعمال مع إمكانية نقل التبعية الإدارية.'
              : 'Interactive organizational hierarchy rendering all holding, subsidiary, regional, branch, department, and business unit tiers.'}
          </p>
        </div>

        <button
          onClick={fetchTree}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isAr ? 'تحديث الشجرة' : 'Refresh Tree'}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
          {isAr ? 'جاري بناء شجرة البيانات التنظيمية...' : 'Building Organization Hierarchy Tree...'}
        </div>
      ) : treeData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          {isAr ? 'لا توجد بيانات شجرة تنظيمية.' : 'No organization hierarchy available.'}
        </div>
      ) : (
        <div className="space-y-3">
          {treeData.map(rootItem => renderTreeNode(rootItem, 0))}
        </div>
      )}

      {/* Move / Reassign Parent Modal */}
      {movingNode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? 'نقل التبعية الإدارية للكيان' : 'Reassign Node Parent'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? `تغيير الأب المباشر للكيان: ${movingNode.nameAr}` : `Select new parent for node: ${movingNode.name}`}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? 'اختر الكيان الأب الجديد' : 'Select New Parent Node'}
              </label>
              <select
                value={selectedNewParentId}
                onChange={e => setSelectedNewParentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">{isAr ? '-- المستوى الأعلى الجذر (ROOT) --' : '-- Top Root Level (No Parent) --'}</option>
                {allNodes
                  .filter(n => n.id !== movingNode.id && !n.lineagePath.includes(movingNode.id))
                  .map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.code}] {isAr ? n.nameAr : n.name} ({n.type})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMovingNode(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                disabled={isMoveSubmitting}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {isMoveSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ التغيير' : 'Confirm Move'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
