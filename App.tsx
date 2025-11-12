
import React, { useMemo } from 'react';
import { MOCK_ASSETS } from './constants';
import { AssetStatus, CryptographicAsset } from './types';
import { CriticalAlerts } from './components/CriticalAlerts';
import { ReadinessScore } from './components/ReadinessScore';
import { AssetInventoryTable } from './components/AssetInventoryTable';

const Header: React.FC = () => (
    <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text-primary">PQC Readiness Dashboard</h1>
        <p className="text-brand-text-secondary mt-1">
            Monitoring cryptographic assets for Post-Quantum readiness.
        </p>
    </header>
);

const App: React.FC = () => {
    const assets: CryptographicAsset[] = MOCK_ASSETS;

    const readinessScore = useMemo(() => {
        if (assets.length === 0) return 0;

        const scoreMap = {
            [AssetStatus.PQC_READY]: 100,
            [AssetStatus.IN_PROGRESS]: 50,
            [AssetStatus.NOT_STARTED]: 10,
            [AssetStatus.VULNERABLE]: 0,
        };

        const totalScore = assets.reduce((acc, asset) => acc + scoreMap[asset.status], 0);
        const maxScore = assets.length * 100;
        
        return Math.round((totalScore / maxScore) * 100);
    }, [assets]);


    return (
        <div className="min-h-screen bg-brand-bg font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Header />
                
                <main className="space-y-8">
                    <CriticalAlerts assets={assets} />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                           <ReadinessScore score={readinessScore} />
                        </div>
                        <div className="lg:col-span-3">
                           <AssetInventoryTable assets={assets} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
