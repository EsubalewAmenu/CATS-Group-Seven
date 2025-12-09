-- Add farmer information columns to batches table
-- This allows union employees to register farmer details with each batch

ALTER TABLE public.batches
ADD COLUMN farmer_name TEXT,
ADD COLUMN farmer_photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.batches.farmer_name IS 'Name of the farmer who produced this batch (registered by union employee)';
COMMENT ON COLUMN public.batches.farmer_photo_url IS 'Optional photo URL of the farmer';
