-- Create blockchain_metadata table
CREATE TABLE public.blockchain_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID UNIQUE NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    policy_id TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_name_hex TEXT NOT NULL,
    mint_transaction_hash TEXT UNIQUE NOT NULL,
    cip25_metadata JSONB NOT NULL, -- The full CIP-25 JSON
    ipfs_hash TEXT, -- Future: IPFS content hash
    ipfs_metadata JSONB, -- Future: Additional IPFS data
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_blockchain_batch ON blockchain_metadata(batch_id);
CREATE INDEX idx_blockchain_policy ON blockchain_metadata(policy_id);
CREATE INDEX idx_blockchain_tx ON blockchain_metadata(mint_transaction_hash);

COMMENT ON TABLE public.blockchain_metadata IS 'Links batches to Cardano blockchain assets';
