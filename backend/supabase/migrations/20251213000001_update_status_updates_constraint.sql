-- Update check constraint on status_updates table to allow detailed processing stages

ALTER TABLE public.status_updates
DROP CONSTRAINT status_updates_action_type_check;

ALTER TABLE public.status_updates
ADD CONSTRAINT status_updates_action_type_check CHECK (action_type IN (
    'HARVESTED',
    'PROCESSING_STARTED',
    'PROCESSING_COMPLETE',
    'QUALITY_CHECKED',
    'IN_TRANSIT',
    'DELIVERED',
    'RETAIL_READY',
    -- New Detailed Statuses
    'PROCESSING_WASHED',
    'PROCESSING_DRIED',
    'PROCESSING_MILLED',
    'PROCESSING_GRADED',
    'PROCESSING_EXPORTED'
));
