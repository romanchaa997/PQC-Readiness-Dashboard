
import React from 'react';
import { AssetStatus } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, WrenchIcon, HourglassIcon } from './icons';

interface StatusBadgeProps {
  status: AssetStatus;
}

const statusConfig = {
  [AssetStatus.VULNERABLE]: {
    color: 'bg-brand-danger/20 text-brand-danger',
    icon: <AlertTriangleIcon className="w-4 h-4" />,
  },
  [AssetStatus.IN_PROGRESS]: {
    color: 'bg-brand-primary/20 text-brand-primary',
    icon: <WrenchIcon className="w-4 h-4" />,
  },
  [AssetStatus.PQC_READY]: {
    color: 'bg-brand-success/20 text-brand-success',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  [AssetStatus.NOT_STARTED]: {
    color: 'bg-brand-text-secondary/20 text-brand-text-secondary',
    icon: <HourglassIcon className="w-4 h-4" />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
      {config.icon}
      <span>{status}</span>
    </div>
  );
};
