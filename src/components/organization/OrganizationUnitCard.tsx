import React from 'react';
import { Branch, Department, CostCenter } from '../../types/organization';
import { MapPin, Building, DollarSign, Users, Phone, Mail } from 'lucide-react';

interface BranchCardProps {
  type: 'branch';
  data: Branch;
}

interface DepartmentCardProps {
  type: 'department';
  data: Department;
}

interface CostCenterCardProps {
  type: 'costCenter';
  data: CostCenter;
}

type OrganizationUnitCardProps = BranchCardProps | DepartmentCardProps | CostCenterCardProps;

export const OrganizationUnitCard: React.FC<OrganizationUnitCardProps> = (props) => {
  if (props.type === 'branch') {
    const { data } = props;
    return (
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              {data.code}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {data.status}
            </span>
          </div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{data.name}</h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {data.city}, {data.country}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 space-y-1">
          {data.managerName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Manager:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{data.managerName}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Phone:</span>
            <span>{data.phone}</span>
          </div>
        </div>
      </div>
    );
  }

  if (props.type === 'department') {
    const { data } = props;
    return (
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
            {data.type}
          </span>
          {data.costCenterCode && (
            <span className="text-[10px] text-slate-400">{data.costCenterCode}</span>
          )}
        </div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{data.name}</h4>
        {data.nameAr && <p className="text-xs text-slate-400 font-arabic">{data.nameAr}</p>}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{data.employeeCount || 0} Members</span>
          </div>
          {data.managerName && <span className="font-medium text-slate-700 dark:text-slate-300">{data.managerName}</span>}
        </div>
      </div>
    );
  }

  if (props.type === 'costCenter') {
    const { data } = props;
    const spentPercentage = Math.round((data.budgetSpent / (data.budgetAllocated || 1)) * 100);
    return (
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
            {data.code}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">{data.type}</span>
        </div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{data.name}</h4>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Budget Spent:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {data.budgetSpent.toLocaleString()} / {data.budgetAllocated.toLocaleString()} {data.currency}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                spentPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
