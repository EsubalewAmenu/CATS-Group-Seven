import React, { useState } from 'react';
import { Batch } from '../../types/supplychain';
import { useWallet } from '../../hooks/useWallet';
import { recordMinting } from '../../services/api';
import WalletConnector from '../common/WalletConnector';
import QRCodeDisplay from '../common/QRCodeDisplay';
import LoadingSpinner from '../common/LoadingSpinner';

interface MintBatchProps {
  batch: Batch | null;
}

export default function MintBatch({ batch }: MintBatchProps) {
  const { wallet, connectWallet, disconnectWallet, isConnecting, sendTip } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintedToken, setMintedToken] = useState<string | null>(null);

  const handleMint = async () => {
    if (!batch || !wallet) return;

    setIsMinting(true);
    try {
      // Generate metadata
      const policyId = `policy_${Date.now()}`; // Mock Policy ID
      const assetName = `BATCH${batch.id.substring(0, 8)}`;
      const metadata = {
        "721": {
          [policyId]: {
            [assetName]: {
              name: `${batch.variety} - ${batch.location}`,
              image: "ipfs://QmMockHash",
              description: `Premium ${batch.cropType} from ${batch.location}`,
              project: "Ethio-Origin",
              origin: {
                farmer: batch.farmer.name,
                region: batch.location,
                elevation: batch.farmer.elevation,
                gps: batch.farmer.gps,
                harvest_date: batch.harvestDate
              },
              specifications: {
                variety: batch.variety,
                process: "Washed", // Should come from batch details
                initial_weight: `${batch.initialWeight}kg`
              },
              files: []
            }
          }
        }
      };

      // Record minting in database
      await recordMinting(batch.id, policyId, assetName, metadata);

      const tokenId = `${policyId}.${assetName}`;
      setMintedToken(tokenId);

      console.log('Minting batch:', batch.id);
      console.log('Wallet:', wallet.address);
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed: ' + (error as any).message);
    } finally {
      setIsMinting(false);
    }
  };

  if (!batch) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🪙</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Batch</h3>
        <p className="text-gray-500">
          Please select a batch from your list to mint as a Cardano native asset
        </p>
      </div>
    );
  }

  const handleConnect = async (walletName: string): Promise<void> => {
    await connectWallet(walletName);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🪙</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Mint Batch Token</h2>
          <p className="text-gray-600">Create a Cardano native asset for your harvest batch</p>
        </div>

        {/* Batch Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Batch Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">ID:</span> {(batch as any).batch_number || batch.id.substring(0, 8)}</div>
            <div><span className="font-medium">Crop:</span> {batch.cropType}</div>
            <div><span className="font-medium">Weight:</span> {batch.initialWeight}kg</div>
            <div><span className="font-medium">Location:</span> {batch.location}</div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">1. Connect Wallet</h3>
          <WalletConnector
            onConnect={handleConnect}
            onDisconnect={disconnectWallet}
            wallet={wallet}
            isConnecting={isConnecting}
          />
        </div>

        {/* Minting Section */}
        {wallet && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">2. Mint Token</h3>
            {!mintedToken ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 mb-4">
                  This will create a unique Cardano native asset representing your batch.
                  The token will include metadata about the harvest and origin.
                </p>
                <button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isMinting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Minting...</span>
                    </>
                  ) : (
                    'Mint Batch Token'
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-green-500 text-lg mr-2">✓</span>
                  <span className="font-semibold text-green-800">Token Minted Successfully!</span>
                </div>
                <p className="text-green-700 mb-4">
                  Your batch has been tokenized on the Cardano blockchain.
                </p>
                <QRCodeDisplay
                  data={mintedToken}
                  title="Batch Token QR"
                />
              </div>
            )}
          </div>
        )}

        {/* Token Metadata Preview */}
        {wallet && !mintedToken && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Token Metadata Preview</h3>
            <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {JSON.stringify({
                "721": {
                  "[POLICY_ID]": {
                    "[ASSET_NAME]": {
                      "name": `${batch.variety} - ${batch.location}`,
                      "image": "ipfs://...",
                      "description": `Premium ${batch.cropType} from ${batch.location}`,
                      "origin": {
                        "farmer": batch.farmer.name,
                        "region": batch.location,
                        "harvest_date": batch.harvestDate
                      }
                    }
                  }
                }
              }, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
