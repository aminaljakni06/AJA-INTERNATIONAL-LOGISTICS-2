import React from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { Building2, MapPin, ChevronDown, Check } from 'lucide-react';

interface CompanyBranchSelectorProps {
  className?: string;
  showCompanyOnly?: boolean;
}

export const CompanyBranchSelector: React.FC<CompanyBranchSelectorProps> = ({
  className = '',
  showCompanyOnly = false,
}) => {
  const { company, currentBranch, branches, setCurrentBranchId } = useOrganization();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!company) return null;

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div className="flex items-center gap-2">
        {/* Company Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="truncate max-w-[140px]">{company.tradeName || company.legalName}</span>
        </div>

        {/* Branch Selector Dropdown */}
        {!showCompanyOnly && branches.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-xs font-medium text-blue-800 dark:text-blue-300 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentBranch?.code || 'Select Branch'}</span>
              <ChevronDown className="w-3 h-3 text-blue-400" />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1"
                onMouseLeave={() => setIsOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Select Active Branch
                  </p>
                </div>
                {branches.map((b) => {
                  const isSelected = currentBranch?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setCurrentBranchId(b.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-xs ${
                        isSelected
                          ? 'font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5">
                          {b.name}
                          {b.isHeadquarters && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold">
                              HQ
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {b.city}, {b.country}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
