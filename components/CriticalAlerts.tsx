import React from 'react';
import { CryptographicAsset, AssetStatus } from '../types';
import { AlertTriangleIcon } from './icons';

interface CriticalAlertsProps {
  assets: CryptographicAsset[];
}

export const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ assets }) => {
  const vulnerableAssets = assets.filter(asset => asset.status === AssetStatus.VULNERABLE);

  if (vulnerableAssets.length === 0) {
    return null;
  }

  return (
    <div className="bg-brand-danger/10 border border-brand-danger/50 rounded-lg p-6 mb-8">
      <div className="flex items-start">
        <AlertTriangleIcon className="w-6 h-6 text-brand-danger mr-4 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-brand-danger">
            {vulnerableAssets.length} Critical Alert{vulnerableAssets.length > 1 ? 's' : ''}
          </h3>
          <p className="text-brand-text-secondary mt-1">
            The following assets are vulnerable to quantum attacks and require immediate attention.
          </p>
          <ul className="mt-4 space-y-2">
            {vulnerableAssets.map(asset => (
              <li key={asset.id} className="text-sm">
                <span className="font-semibold text-brand-text-primary">{asset.name} ({asset.algorithm})</span>
                <span className="text-brand-text-secondary"> - Recommended Action: Initiate migration to a PQC-safe algorithm.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};