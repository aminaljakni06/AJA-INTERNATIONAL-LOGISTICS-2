import React, { useState } from 'react';
import { ReportingTreeNode } from '../../types/organization';
import { User, ChevronRight, ChevronDown, ShieldCheck, Mail, Briefcase } from 'lucide-react';

interface OrganizationHierarchyTreeProps {
  node?: ReportingTreeNode | null;
}

const TreeNodeCard: React.FC<{ node: ReportingTreeNode; level?: number }> = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const hasSubordinates = node.subordinates && node.subordinates.length > 0;

  return (
    <div className="flex flex-col items-start my-1 text-xs">
      <div className="flex items-center gap-2 group">
        {hasSubordinates && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
        {!hasSubordinates && <span className="w-5" />}

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            {node.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{node.fullName}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {node.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {node.position}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {node.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasSubordinates && expanded && (
        <div className="pl-6 ml-2 border-l-2 border-slate-200 dark:border-slate-800 pt-2 flex flex-col gap-2">
          {node.subordinates.map((sub) => (
            <TreeNodeCard key={sub.id} node={sub} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrganizationHierarchyTree: React.FC<OrganizationHierarchyTreeProps> = ({ node }) => {
  if (!node) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No reporting hierarchy structure loaded.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 overflow-x-auto">
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        Executive Reporting & Management Tree
      </div>
      <TreeNodeCard node={node} />
    </div>
  );
};
