import React from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import MintedTokensList from './MintedTokensList';
import StatusUpdate from './StatusUpdate';
import DashboardLayout from '../layout/DashboardLayout';
import { useBatches } from '../../hooks/useBatches';

export default function ProcessorPortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('batchId');
  const { mintedBatches, refreshBatches } = useBatches();

  // Find the selected batch
  const selectedBatch = batchId ? mintedBatches.find(b => b.id === batchId) || null : null;

  return (
    <DashboardLayout role="processor" title="Processor Portal" subtitle="View minted tokens and update processing status">
      <div className="max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="tokens" replace />} />
          <Route path="tokens" element={<MintedTokensList />} />
          <Route
            path="update"
            element={
              <StatusUpdate
                batch={selectedBatch}
                onSuccess={() => {
                  refreshBatches();
                  navigate('/processor/tokens');
                }}
              />
            }
          />
        </Routes>
      </div>
    </DashboardLayout>
  );
}
