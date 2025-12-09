import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useBatches } from '../../hooks/useBatches';
import { supabase } from '../../lib/supabase';
import HarvestForm from './HarvestForm';
import BatchList from './BatchList';
import MintBatch from './MintBatch';
import LoadingSpinner from '../common/LoadingSpinner';
import DashboardLayout from '../layout/DashboardLayout';

export default function UnionDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { batches, isLoading, error, removeBatch } = useBatches();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                navigate('/roles');
            }
        });
    }, [navigate]);

    const batchId = searchParams.get('batchId');
    const selectedBatch = batches.find(b => b.id === batchId) || null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading batches..." />
            </div>
        );
    }

    return (
        <DashboardLayout role="union" title="Union Dashboard" subtitle="Register farmer harvests and track batches">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Route Content */}
            <Routes>
                <Route path="/" element={<Navigate to="batches" replace />} />
                <Route
                    path="batches"
                    element={
                        <BatchList
                            batches={batches}
                            onSelectBatch={(batch) => navigate(`/union/mint?batchId=${batch.id}`)}
                            selectedBatch={null}
                            onCreateBatch={() => navigate('/union/new-harvest')}
                            onDeleteBatch={removeBatch}
                        />
                    }
                />
                <Route
                    path="new-harvest"
                    element={<HarvestForm onSuccess={() => navigate('/union/batches')} />}
                />
                <Route
                    path="mint"
                    element={<MintBatch batch={selectedBatch} />}
                />
            </Routes>
        </DashboardLayout>
    );
}
