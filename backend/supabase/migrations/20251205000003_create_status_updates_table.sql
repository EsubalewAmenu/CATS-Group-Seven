-- Create status_updates table
CREATE TABLE public.status_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'HARVESTED',
        'PROCESSING_STARTED',
        'PROCESSING_COMPLETE',
        'QUALITY_CHECKED',
        'IN_TRANSIT',
        'DELIVERED',
        'RETAIL_READY'
    )),
    actor_role TEXT NOT NULL,
    update_data JSONB DEFAULT '{}'::jsonb, -- Store weights, scores, etc.
    notes TEXT,
    transaction_hash TEXT, -- Cardano transaction hash
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_status_updates_batch ON status_updates(batch_id);
CREATE INDEX idx_status_updates_actor ON status_updates(actor_id);
CREATE INDEX idx_status_updates_created ON status_updates(created_at DESC);

COMMENT ON TABLE public.status_updates IS 'Audit trail of all batch movements and updates';
