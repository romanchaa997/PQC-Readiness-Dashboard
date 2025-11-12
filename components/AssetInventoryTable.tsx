import React, { useState, useMemo } from 'react';
import { CryptographicAsset, AssetStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ChevronDownIcon, ArrowUpDownIcon, SearchIcon } from './icons';

interface AssetRowProps {
    asset: CryptographicAsset;
    isExpanded: boolean;
    onToggle: () => void;
}

const AssetRow: React.FC<AssetRowProps> = ({ asset, isExpanded, onToggle }) => {
    return (
        <>
            <tr onClick={onToggle} className="cursor-pointer border-b border-brand-border hover:bg-brand-surface/50 transition-colors duration-200">
                <td className="p-4">{asset.name}</td>
                <td className="p-4">{asset.type}</td>
                <td className="p-4">{asset.algorithm}</td>
                <td className="p-4 text-sm text-brand-text-secondary">
                    {asset.associatedSystems[0] || 'N/A'}
                    {asset.associatedSystems.length > 1 && <span className="ml-2 text-xs opacity-70">+{asset.associatedSystems.length - 1} more</span>}
                </td>
                <td className="p-4">
                    <StatusBadge status={asset.status} />
                </td>
                <td className="p-4 text-center">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-brand-surface/30">
                    <td colSpan={6} className="p-0">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                            <div>
                                <h4 className="font-semibold text-brand-text-secondary mb-1">Migration Plan Status</h4>
                                <p>{asset.migrationPlanStatus}</p>
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
}

type SortKey = keyof CryptographicAsset;

export const AssetInventoryTable: React.FC<AssetInventoryTableProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const uniqueTypes = useMemo(() => ['All', ...Array.from(new Set(assets.map(a => a.type)))], [assets]);
  const statusOptions: (AssetStatus | 'All')[] = ['All', ...Object.values(AssetStatus)];

  const filteredAndSortedAssets = useMemo(() => {
    let sortableAssets = [...assets];

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

      sortableAssets.sort((a, b) => {
        let result = 0;
        
        if (sortConfig.key === 'status') {
          result = statusSortOrder[a.status] - statusSortOrder[b.status];
        } else if (sortConfig.key === 'associatedSystems') {
          const valA = a.associatedSystems[0] || '';
          const valB = b.associatedSystems[0] || '';
          result = valA.localeCompare(valB);
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
  }, [assets, searchTerm, statusFilter, typeFilter, sortConfig]);
  
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
                  ['associatedSystems', 'Primary System'],
                  ['status', 'Status']
              ] as const).map(([key, label]) => (
                <th key={key} scope="col" className="p-4 cursor-pointer hover:bg-brand-surface" onClick={() => requestSort(key)}>
                  <div className="flex items-center gap-2">{label} {renderSortIcon(key)}</div>
                </th>
              ))}
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
                    />
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="text-center p-8 text-brand-text-secondary">No assets found matching your criteria.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};