import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatches } from '../../hooks/useBatches';
import { Batch } from '../../types/supplychain';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

// Group batches by farmer name
function groupByFarmer(batches: Batch[]): Record<string, Batch[]> {
    return batches.reduce((groups, batch) => {
        const farmerName = batch.farmer?.name || 'Unknown Farmer';
        if (!groups[farmerName]) {
            groups[farmerName] = [];
        }
        groups[farmerName].push(batch);
        return groups;
    }, {} as Record<string, Batch[]>);
}

// Get status badge color
function getStatusColor(status: string) {
    switch (status) {
        case 'harvested': return 'bg-emerald-100 text-emerald-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'processed': return 'bg-purple-100 text-purple-800';
        case 'in_transit': return 'bg-amber-100 text-amber-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export default function MintedTokensList() {
    const navigate = useNavigate();
    const { mintedBatches, isLoading, error } = useBatches();

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading minted tokens..." />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 bg-red-50 border-red-200">
                <p className="text-red-800">{error}</p>
            </Card>
        );
    }

    if (mintedBatches.length === 0) {
        return (
            <Card className="p-12 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🪙</span>
                </div>
                <h3 className="text-xl font-semibold text-stone-600 mb-2">No minted tokens yet</h3>
                <p className="text-stone-500">
                    Minted tokens will appear here once farmers register and mint their batches.
                </p>
            </Card>
        );
    }

    const groupedByFarmer = groupByFarmer(mintedBatches);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-stone-800">Minted Tokens</h2>
                <div className="text-sm text-stone-500">
                    {mintedBatches.length} token{mintedBatches.length !== 1 ? 's' : ''} from {Object.keys(groupedByFarmer).length} farmer{Object.keys(groupedByFarmer).length !== 1 ? 's' : ''}
                </div>
            </div>

            {Object.entries(groupedByFarmer).map(([farmerName, tokens]) => (
                <div key={farmerName} className="space-y-4">
                    {/* Farmer Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-stone-200">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-lg">👨‍🌾</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800">{farmerName}</h3>
                            <p className="text-sm text-stone-500">{tokens.length} token{tokens.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {/* Token Cards */}
                    <div className="grid gap-3 pl-4">
                        {tokens.map((batch, index) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-mono text-sm text-stone-600">
                                                        #{batch.batchNumber || batch.id.substring(0, 8)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(batch.status)}`}>
                                                        {batch.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-sm text-stone-600 mb-3">
                                                    <div>
                                                        <span className="text-stone-400">Crop:</span> {batch.cropType}
                                                    </div>
                                                    <div>
                                                        <span className="text-stone-400">Variety:</span> {batch.variety}
                                                    </div>
                                                    <div>
                                                        <span className="text-stone-400">Weight:</span> {batch.initialWeight}kg
                                                    </div>
                                                </div>

                                                {batch.mintTxHash && (
                                                    <div className="text-xs text-stone-400 font-mono truncate">
                                                        TX: {batch.mintTxHash.substring(0, 24)}...
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => navigate(`/processor/update?batchId=${batch.id}`)}
                                                className="ml-4"
                                            >
                                                Process
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
