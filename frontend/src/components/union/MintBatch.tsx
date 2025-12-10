import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Batch } from '../../types/supplychain';
import { mintBatchToken, getCardanoScanTxUrl, getCardanoScanTokenUrl, MintError } from '../../services/cardanoApi';
import { recordMinting } from '../../services/api';
import QRCodeDisplay from '../common/QRCodeDisplay';
import LoadingSpinner from '../common/LoadingSpinner';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface MintBatchProps {
  batch: Batch | null;
  onMintSuccess?: () => void;
}

// Time to wait before showing CardanoScan links (blockchain confirmation delay)
const BLOCKCHAIN_CONFIRMATION_DELAY_MS = 120000; // 2 minutes

export default function MintBatch({ batch, onMintSuccess }: MintBatchProps) {
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [justMinted, setJustMinted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linksReady, setLinksReady] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for links (only for freshly minted)
  useEffect(() => {
    if (justMinted && !linksReady) {
      setCountdown(BLOCKCHAIN_CONFIRMATION_DELAY_MS / 1000);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setLinksReady(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [justMinted, linksReady]);

  const handleMint = async () => {
    if (!batch) return;

    setIsMinting(true);
    setError(null);

    try {
      const response = await mintBatchToken(batch);

      const tokenName = `Coffee#${batch.batchNumber?.replace('BATCH-', '') || batch.id.substring(0, 8)}`;
      const metadata = {
        name: `Coffee batch ${batch.batchNumber || batch.id.substring(0, 8)}`,
        weight: String(batch.initialWeight),
        unit: 'kg',
        variety: batch.variety,
        farmer: batch.farmer?.name || 'Unknown',
        harvestDate: batch.harvestDate,
        cropType: batch.cropType
      };

      await recordMinting(
        batch.id,
        response.policyId,
        tokenName,
        response.txHash,
        response.unit,
        metadata
      );

      setJustMinted(true);

      if (onMintSuccess) {
        onMintSuccess();
      }
    } catch (err) {
      console.error('Minting failed:', err);
      if (err instanceof MintError) {
        setError(err.message);
      } else {
        setError('Failed to mint batch: ' + (err as Error).message);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // No batch selected
  if (!batch) {
    return (
      <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🪙</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Batch</h3>
        <p className="text-gray-500 mb-4">
          Please select a batch from your list to mint as a Cardano native asset
        </p>
        <Button onClick={() => navigate('/union/batches')}>
          View Batches
        </Button>
      </Card>
    );
  }

  // Show SUCCESS view if: just minted OR batch is already minted
  if (justMinted || batch.isMinted) {
    const txHash = batch.mintTxHash || '';
    const unit = batch.mintUnit || '';
    const policyId = batch.policyId || '';
    const showCountdown = justMinted && !linksReady;

    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                {justMinted ? 'Token Minted Successfully!' : 'Token Minted'}
              </h3>
              <p className="text-emerald-700 text-sm mb-4">
                This batch has been recorded on the Cardano blockchain.
              </p>

              {/* Transaction Details */}
              {txHash && (
                <div className="bg-white rounded-lg p-3 text-left space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transaction:</span>
                    <span className="font-mono text-xs truncate max-w-[180px]">{txHash.substring(0, 24)}...</span>
                  </div>
                  {policyId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Policy ID:</span>
                      <span className="font-mono text-xs truncate max-w-[180px]">{policyId.substring(0, 24)}...</span>
                    </div>
                  )}
                </div>
              )}

              {/* CardanoScan Links */}
              {showCountdown ? (
                <div className="text-center">
                  <p className="text-amber-700 text-sm mb-2">
                    ⏳ Waiting for blockchain confirmation...
                  </p>
                  <p className="text-gray-500 text-xs">
                    CardanoScan links available in <strong>{formatCountdown(countdown)}</strong>
                  </p>
                </div>
              ) : txHash ? (
                <div className="flex gap-2 justify-center flex-wrap">
                  <a href={getCardanoScanTxUrl(txHash)} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">🔍 View Transaction</Button>
                  </a>
                  {unit && (
                    <a href={getCardanoScanTokenUrl(unit)} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">🪙 View Token</Button>
                    </a>
                  )}
                </div>
              ) : null}
            </div>

            {/* QR Code */}
            {unit && <QRCodeDisplay data={unit} title="Token QR Code" />}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/union/batches')} className="flex-1">
                Back to Batches
              </Button>
              <Button onClick={() => navigate('/union/minted')} className="flex-1">
                View Minted Batches
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mint form (batch is NOT minted yet)
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🪙</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Mint Batch Token</h2>
            <p className="text-gray-600">Create a Cardano native asset for this harvest batch</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Batch Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Batch:</span> <span className="font-medium">{batch.batchNumber || batch.id.substring(0, 8)}</span></div>
              <div><span className="text-gray-500">Crop:</span> <span className="font-medium capitalize">{batch.cropType}</span></div>
              <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{batch.initialWeight}kg</span></div>
              <div><span className="text-gray-500">Variety:</span> <span className="font-medium">{batch.variety}</span></div>
              <div><span className="text-gray-500">Farmer:</span> <span className="font-medium">{batch.farmer.name}</span></div>
              <div><span className="text-gray-500">GPS:</span> <span className="font-medium text-xs">{batch.farmer.gps || 'N/A'}</span></div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              This creates a permanent NFT on Cardano. This action cannot be undone.
            </p>
          </div>

          <Button onClick={handleMint} disabled={isMinting} className="w-full h-12 text-lg">
            {isMinting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Minting on Cardano...
              </span>
            ) : (
              'Mint Batch Token'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
