import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Batch } from '../../types/supplychain';
import { transferToken, getCardanoScanTxUrl, MintError } from '../../services/cardanoApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface StatusUpdateProps {
  batch: Batch | null;
  onSuccess?: () => void;
}

const PROCESSING_STATUSES = [
  { value: 'washed', label: 'Washed', description: 'Beans have been washed and cleaned' },
  { value: 'dried', label: 'Dried', description: 'Beans have been dried to target moisture' },
  { value: 'milled', label: 'Milled', description: 'Beans have been hulled and polished' },
  { value: 'graded', label: 'Graded', description: 'Beans have been sorted and graded' },
  { value: 'exported', label: 'Ready for Export', description: 'Beans are packaged and ready to ship' }
];

export default function StatusUpdate({ batch, onSuccess }: StatusUpdateProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    status: 'washed',
    description: '',
    note: ''
  });

  if (!batch) {
    return (
      <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Token Selected</h3>
        <p className="text-gray-500 mb-4">
          Please select a minted token from the list to update its status
        </p>
        <Button onClick={() => navigate('/processor/tokens')}>
          View Tokens
        </Button>
      </Card>
    );
  }

  // Check if batch has assetUnit for transfer
  const assetUnit = batch.mintUnit;

  if (!assetUnit) {
    return (
      <Card className="p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Token Not Found</h3>
        <p className="text-gray-500">
          This batch doesn't have a valid asset unit for transfer.
        </p>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await transferToken(
        assetUnit,
        formData.status,
        formData.description,
        formData.note
      );

      setTxHash(result.txHash);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Transfer failed:', err);
      if (err instanceof MintError) {
        setError(err.message);
      } else {
        setError('Failed to update status: ' + (err as Error).message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (txHash) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-600 text-xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">Status Updated Successfully!</h3>
            <p className="text-emerald-700 text-sm mb-4">
              Token metadata has been updated on the Cardano blockchain.
            </p>
            <div className="bg-white rounded-lg p-3 text-left space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction:</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{txHash.substring(0, 24)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Status:</span>
                <span className="font-medium capitalize">{formData.status}</span>
              </div>
            </div>
            <a href={getCardanoScanTxUrl(txHash)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">🔍 View on CardanoScan</Button>
            </a>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/processor/tokens')} className="flex-1">
              Back to Tokens
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Batch Header */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                #{batch.batchNumber || batch.id.substring(0, 8)}
              </h3>
              <p className="text-gray-600 capitalize">{batch.cropType} • {batch.variety}</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium capitalize">
                Current: {batch.status}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
            <div><span className="font-medium">Farmer:</span> {batch.farmer.name}</div>
            <div><span className="font-medium">Weight:</span> {batch.initialWeight}kg</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              New Processing Status *
            </label>
            <div className="grid gap-2">
              {PROCESSING_STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                  className={`p-4 border-2 rounded-lg text-left transition ${formData.status === status.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-gray-800">{status.label}</div>
                  <div className="text-sm text-gray-600">{status.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Processed at Station A"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Notes
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about the processing..."
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Updating on Blockchain...
              </span>
            ) : (
              'Update Token Status'
            )}
          </Button>
        </form>

        {/* Metadata Preview */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-2">Blockchain Metadata Preview</h4>
          <pre className="text-green-400 text-sm overflow-x-auto">
            {JSON.stringify({
              status: formData.status,
              description: formData.description,
              note: formData.note
            }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
