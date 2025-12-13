-- Update check constraint on batches table to allow detailed processing stages

ALTER TABLE public.batches
DROP CONSTRAINT batches_status_check;

ALTER TABLE public.batches
ADD CONSTRAINT batches_status_check CHECK (status IN (
    'harvested',
    'processing',
    'processed',
    'in_transit',
    'delivered',
    'retail',
    -- Detailed processing stages
    'washed',
    'dried',
    'milled',
    'graded',
    'exported'
));
