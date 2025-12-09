import React, { useState } from 'react';
import { Batch } from '../../types/supplychain';
import { formatDate } from '../../utils/formatters';
import { BATCH_STATUS } from '../../utils/constants';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface BatchListProps {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
  selectedBatch: Batch | null;
  onCreateBatch: () => void;
  onDeleteBatch: (batchId: string) => void;
}

export default function BatchList({ batches, onSelectBatch, selectedBatch, onCreateBatch, onDeleteBatch }: BatchListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const statusConfig = BATCH_STATUS[status as keyof typeof BATCH_STATUS];
    return statusConfig?.color || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = BATCH_STATUS[status as keyof typeof BATCH_STATUS];
    return statusConfig?.label || status.replace(/_/g, ' ');
  };

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  if (batches.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🌱</span>
        </div>
        <h3 className="text-xl font-semibold text-stone-600 mb-2">No batches yet</h3>
        <p className="text-stone-500 mb-6">Register your first harvest to start tracking on blockchain</p>
        <Button
          onClick={onCreateBatch}
          size="lg"
        >
          Create First Batch
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-stone-800">Your Harvest Batches</h2>
        <div className="text-sm text-stone-500">
          {batches.length} batch{batches.length !== 1 ? 'es' : ''}
        </div>
      </div>

      <div className="grid gap-4">
        {batches.map((batch, index) => (
          <motion.div
            key={batch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onSelectBatch(batch)}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2",
                selectedBatch?.id === batch.id
                  ? "border-emerald-500 bg-emerald-50/30"
                  : "border-transparent hover:border-stone-200"
              )}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg text-stone-800 flex items-center">
                        <span className="text-stone-400 font-normal text-sm mr-1">#</span>
                        {batch.batchNumber || batch.id.substring(0, 8)}
                      </h3>
                      <button
                        onClick={(e) => handleCopy(e, batch.batchNumber || batch.id)}
                        className="ml-2 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded hover:bg-stone-100"
                        title="Copy Batch ID"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                    <p className="text-stone-600 capitalize">{batch.cropType} • {batch.variety}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`bg-${getStatusColor(batch.status)}-100 text-${getStatusColor(batch.status)}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                      {getStatusLabel(batch.status)}
                    </span>
                    {batch.grade && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {batch.grade}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-stone-600 mb-3">
                  <div>
                    <span className="font-medium">Weight:</span> {batch.initialWeight}kg
                    {batch.currentWeight && batch.currentWeight !== batch.initialWeight && (
                      <span className="text-stone-400 ml-1">
                        ({batch.currentWeight}kg current)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {batch.location}
                  </div>
                  <div>
                    <span className="font-medium">Harvest Date:</span> {formatDate(batch.harvestDate)}
                  </div>
                  <div>
                    <span className="font-medium">Farmer:</span> {batch.farmer.name}
                  </div>
                </div>

                {/* Journey Preview */}
                {batch.journey.length > 0 && (
                  <div className="border-t border-stone-100 pt-3 mt-3">
                    <div className="flex items-center space-x-2 text-xs text-stone-500">
                      <span>Last update:</span>
                      <span className="font-medium">
                        {batch.journey[batch.journey.length - 1].action.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{formatDate(batch.journey[batch.journey.length - 1].timestamp)}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end mt-4 pt-2 border-t border-stone-100">
                  {confirmDeleteId === batch.id ? (
                    <div className="flex space-x-2 items-center">
                      <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBatch(batch.id);
                          setConfirmDeleteId(null);
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(batch.id);
                      }}
                    >
                      Delete Batch
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
