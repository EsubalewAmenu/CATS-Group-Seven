-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'harvested' CHECK (status IN (
        'harvested', 
        'processing', 
        'processed', 
        'in_transit', 
        'delivered', 
        'retail'
    )),
    crop_type TEXT NOT NULL,
    initial_weight DECIMAL(10, 2) NOT NULL,
    current_weight DECIMAL(10, 2) NOT NULL,
    variety TEXT,
    process_method TEXT,
    grade TEXT,
    elevation TEXT,
    location JSONB NOT NULL, -- {lat, lng, gps_string, region}
    qr_code TEXT UNIQUE NOT NULL,
    harvest_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_batches_farmer ON batches(farmer_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_qr ON batches(qr_code);
CREATE INDEX idx_batches_batch_number ON batches(batch_number);

-- Create function to auto-generate batch numbers
CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'BATCH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.batches IS 'Product batches tracked through the supply chain';
