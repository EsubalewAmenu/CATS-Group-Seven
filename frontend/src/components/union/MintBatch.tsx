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

interface MintResult {
  txHash: string;
  unit: string;
  policyId: string;
}

// Time to wait before showing CardanoScan links (blockchain confirmation delay)
const BLOCKCHAIN_CONFIRMATION_DELAY_MS = 120000; // 2 minutes

export default function MintBatch({ batch, onMintSuccess }: MintBatchProps) {
  const navigate = useNavigate();
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linksReady, setLinksReady] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for links
  useEffect(() => {
    if (mintResult && !linksReady) {
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
  }, [mintResult, linksReady]);

  const handleMint = async () => {
    if (!batch) return;

    setIsMinting(true);
    setError(null);

    try {
      // Call the real Cardano minting API
      const response = await mintBatchToken(batch);

      // Generate token name for record
      const tokenName = `Coffee#${batch.batchNumber?.replace('BATCH-', '') || batch.id.substring(0, 8)}`;

      // Build metadata that was sent
      const metadata = {
        name: `Coffee batch ${batch.batchNumber || batch.id.substring(0, 8)}`,
        weight: String(batch.initialWeight),
        unit: 'kg',
        variety: batch.variety,
        farmer: batch.farmer?.name || 'Unknown',
        harvestDate: batch.harvestDate,
        cropType: batch.cropType
      };

      // Record the minting in our database
      await recordMinting(
        batch.id,
        response.policyId,
        tokenName,
        response.txHash,
        response.unit,
        metadata
      );

      setMintResult({
        txHash: response.txHash,
        unit: response.unit,
        policyId: response.policyId
      });

      // Notify parent to refresh (but we keep showing success screen)
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

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Show success screen if we just minted (even if batch.isMinted is now true)
  if (mintResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {/* Success Message */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">Token Minted Successfully!</h3>
              <p className="text-emerald-700 text-sm mb-4">
                Your batch has been submitted to the Cardano blockchain.
              </p>

              {/* Transaction Details */}
              <div className="bg-white rounded-lg p-3 text-left space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction Hash:</span>
                  <span className="font-mono text-xs truncate max-w-[180px]">{mintResult.txHash}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Policy ID:</span>
                  <span className="font-mono text-xs truncate max-w-[180px]">{mintResult.policyId}</span>
                </div>
              </div>

              {/* CardanoScan Links - with countdown timer */}
              {linksReady ? (
                <div className="flex gap-2 justify-center">
                  <a
                    href={getCardanoScanTxUrl(mintResult.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      🔍 View Transaction
                    </Button>
                  </a>
                  <a
                    href={getCardanoScanTokenUrl(mintResult.unit)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      🪙 View Token
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-amber-700 text-sm mb-2">
                    ⏳ Waiting for blockchain confirmation...
                  </p>
                  <p className="text-gray-500 text-xs">
                    CardanoScan links will be available in <strong>{formatCountdown(countdown)}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* QR Code */}
            <QRCodeDisplay
              data={mintResult.unit}
              title="Token QR Code"
            />

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/union/batches')}
                className="flex-1"
              >
                Back to Batches
              </Button>
              <Button
                onClick={() => navigate('/union/minted')}
                className="flex-1"
              >
                View Minted Batches
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already minted (from previous session, not this one)
  if (batch.isMinted) {
    return (
      <Card className="p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Already Minted</h2>
          <p className="text-gray-600">This batch has already been tokenized on the blockchain.</p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-emerald-800 mb-2">Blockchain Details</h3>
          <div className="space-y-2 text-sm">
            {batch.mintTxHash && (
              <div>
                <span className="text-emerald-600">Transaction:</span>{' '}
                <span className="font-mono">{batch.mintTxHash.substring(0, 30)}...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {batch.mintTxHash && (
            <a href={getCardanoScanTxUrl(batch.mintTxHash)} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full">View on CardanoScan</Button>
            </a>
          )}
          <Button onClick={() => navigate('/union/minted')} className="flex-1">
            View Minted Batches
          </Button>
        </div>
      </Card>
    );
  }

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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Batch Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Batch Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Batch ID:</span>
                <span className="block font-medium">{batch.batchNumber || batch.id.substring(0, 8)}</span>
              </div>
              <div>
                <span className="text-gray-500">Crop:</span>
                <span className="block font-medium capitalize">{batch.cropType}</span>
              </div>
              <div>
                <span className="text-gray-500">Weight:</span>
                <span className="block font-medium">{batch.initialWeight}kg</span>
              </div>
              <div>
                <span className="text-gray-500">Variety:</span>
                <span className="block font-medium">{batch.variety}</span>
              </div>
              <div>
                <span className="text-gray-500">Farmer:</span>
                <span className="block font-medium">{batch.farmer.name}</span>
              </div>
              <div>
                <span className="text-gray-500">GPS:</span>
                <span className="block font-medium text-xs">{batch.farmer.gps || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Minting Section */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                This will create a unique Cardano native asset (NFT) representing this batch.
                The token will include metadata about the harvest origin, farmer, and specifications.
                This action cannot be undone.
              </p>
            </div>

            <Button
              onClick={handleMint}
              disabled={isMinting}
              className="w-full h-12 text-lg"
            >
              {isMinting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Minting on Cardano...
                </span>
              ) : (
                'Mint Batch Token'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
