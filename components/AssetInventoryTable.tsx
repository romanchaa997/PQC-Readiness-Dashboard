import React, { useState, useMemo } from 'react';
import { CryptographicAsset, AssetStatus, PriorityLevel } from '../types';
import { StatusBadge } from './StatusBadge';
import { ChevronDownIcon, ArrowUpDownIcon, SearchIcon } from './icons';

interface PriorityBadgeProps {
    priority: PriorityLevel;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
    const priorityConfig = {
        [PriorityLevel.HIGH]: 'text-brand-danger',
        [PriorityLevel.MEDIUM]: 'text-brand-warning',
        [PriorityLevel.LOW]: 'text-brand-success',
    };
    return (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${priorityConfig[priority].replace('text-', 'bg-')}`}></span>
            <span className={priorityConfig[priority]}>{priority}</span>
        </div>
    );
};


interface AssetRowProps {
    asset: CryptographicAsset & { priority: PriorityLevel };
    isExpanded: boolean;
    onToggle: () => void;
    onInitiateMigration: (assetId: string) => void;
}

const AssetRow: React.FC<AssetRowProps> = ({ asset, isExpanded, onToggle, onInitiateMigration }) => {
    return (
        <>
            <tr onClick={onToggle} className="cursor-pointer border-b border-brand-border hover:bg-brand-surface/50 transition-all duration-200 hover:scale-[1.01]">
                <td className="p-4">{asset.name}</td>
                <td className="p-4">{asset.type}</td>
                <td className="p-4">{asset.algorithm}</td>
                <td className="p-4">
                    <PriorityBadge priority={asset.priority} />
                </td>
                <td className="p-4 text-sm text-brand-text-secondary">
                    {asset.associatedSystems[0] || 'N/A'}
                    {asset.associatedSystems.length > 1 && <span className="ml-2 text-xs opacity-70">+{asset.associatedSystems.length - 1} more</span>}
                </td>
                <td className="p-4">
                    <StatusBadge status={asset.status} />
                </td>
                <td className="p-4 text-sm">{asset.migrationPlanStatus}</td>
                <td className="p-4">
                    {asset.status === AssetStatus.VULNERABLE && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onInitiateMigration(asset.id);
                            }}
                            className="bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-md hover:bg-brand-primary/80 transition-colors duration-200 whitespace-nowrap"
                        >
                            Initiate Migration
                        </button>
                    )}
                </td>
                <td className="p-4 text-center">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-brand-surface/30">
                    <td colSpan={9} className="p-0">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-brand-text-secondary mb-1">Associated Systems (All)</h4>
                                <ul className="list-disc list-inside">
                                    {asset.associatedSystems.map(system => <li key={system}>{system}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-brand-text-secondary mb-1">Last Audit Date</h4>
                                <p>{asset.lastAuditDate}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

interface AssetInventoryTableProps {
  assets: CryptographicAsset[];
  onInitiateMigration: (assetId: string) => void;
}

const getPriority = (asset: CryptographicAsset): PriorityLevel => {
    switch (asset.status) {
        case AssetStatus.VULNERABLE:
            return PriorityLevel.HIGH;
        case AssetStatus.IN_PROGRESS:
        case AssetStatus.NOT_STARTED:
            return PriorityLevel.MEDIUM;
        case AssetStatus.PQC_READY:
            return PriorityLevel.LOW;
        default:
            return PriorityLevel.LOW;
    }
};

type SortKey = keyof CryptographicAsset | 'priority';

export const AssetInventoryTable: React.FC<AssetInventoryTableProps> = ({ assets, onInitiateMigration }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const uniqueTypes = useMemo(() => ['All', ...Array.from(new Set(assets.map(a => a.type)))], [assets]);
  const statusOptions: (AssetStatus | 'All')[] = ['All', ...Object.values(AssetStatus)];

  const assetsWithPriority = useMemo(() => {
    return assets.map(asset => ({
      ...asset,
      priority: getPriority(asset),
    }));
  }, [assets]);

  const filteredAndSortedAssets = useMemo(() => {
    let sortableAssets = [...assetsWithPriority];

    // Filtering
    sortableAssets = sortableAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            asset.algorithm.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
      const matchesType = typeFilter === 'All' || asset.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sorting
    if (sortConfig !== null) {
      const statusSortOrder: Record<AssetStatus, number> = {
        [AssetStatus.VULNERABLE]: 0,
        [AssetStatus.IN_PROGRESS]: 1,
        [AssetStatus.NOT_STARTED]: 2,
        [AssetStatus.PQC_READY]: 3,
      };
      
      const migrationPlanSortOrder: Record<string, number> = {
        'Not Started': 0,
        'Awaiting Vendor Patch': 1,
        'Researching Alternatives': 2,
        'Planning Phase': 3,
        'Testing Phase': 4,
        'Migration in Progress': 5,
        'Completed': 6,
      };

      const prioritySortOrder: Record<PriorityLevel, number> = {
        [PriorityLevel.HIGH]: 0,
        [PriorityLevel.MEDIUM]: 1,
        [PriorityLevel.LOW]: 2,
      };

      sortableAssets.sort((a, b) => {
        let result = 0;
        
        if (sortConfig.key === 'status') {
          result = statusSortOrder[a.status] - statusSortOrder[b.status];
        } else if (sortConfig.key === 'priority') {
            result = prioritySortOrder[a.priority] - prioritySortOrder[b.priority];
        } else if (sortConfig.key === 'associatedSystems') {
          const valA = a.associatedSystems[0] || '';
          const valB = b.associatedSystems[0] || '';
          result = valA.localeCompare(valB);
        } else if (sortConfig.key === 'migrationPlanStatus') {
            const valA = migrationPlanSortOrder[a.migrationPlanStatus] ?? 99;
            const valB = migrationPlanSortOrder[b.migrationPlanStatus] ?? 99;
            result = valA - valB;
        } else {
          // Default sorting for other keys
          if (a[sortConfig.key] < b[sortConfig.key]) {
            result = -1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            result = 1;
          }
        }
        
        return sortConfig.direction === 'ascending' ? result : -result;
      });
    }

    return sortableAssets;
  }, [assetsWithPriority, searchTerm, statusFilter, typeFilter, sortConfig]);
  
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleRowToggle = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const renderSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDownIcon className="w-4 h-4 text-brand-text-secondary" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-brand-border">
        <h3 className="text-lg font-semibold mb-4">Cryptographic Asset Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary"/>
                <input
                    type="text"
                    placeholder="Search by name or algorithm..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-brand-bg border border-brand-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
            </div>
            <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as AssetStatus | 'All')}
                className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
                {statusOptions.map(s => <option key={s} value={s}>{s === 'All' ? 'Filter by Status' : s}</option>)}
            </select>
            <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
                {uniqueTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'Filter by Type' : t}</option>)}
            </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-surface/50 text-sm text-brand-text-secondary uppercase">
            <tr>
              {([
                  ['name', 'Asset Name'], 
                  ['type', 'Type'], 
                  ['algorithm', 'Algorithm'],
                  ['priority', 'Priority'], 
                  ['associatedSystems', 'Primary System'],
                  ['status', 'Status'],
                  ['migrationPlanStatus', 'Plan Status'],
              ] as const).map(([key, label]) => (
                <th key={key} scope="col" className="p-4 cursor-pointer hover:bg-brand-surface" onClick={() => requestSort(key)}>
                  <div className="flex items-center gap-2">{label} {renderSortIcon(key)}</div>
                </th>
              ))}
              <th scope="col" className="p-4">Actions</th>
              <th scope="col" className="p-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAssets.length > 0 ? (
                filteredAndSortedAssets.map(asset => (
                    <AssetRow 
                        key={asset.id} 
                        asset={asset}
                        isExpanded={expandedRow === asset.id}
                        onToggle={() => handleRowToggle(asset.id)}
                        onInitiateMigration={onInitiateMigration}
                    />
                ))
            ) : (
                <tr>
                    <td colSpan={9} className="text-center p-8 text-brand-text-secondary">No assets found matching your criteria.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};