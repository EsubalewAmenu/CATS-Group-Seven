-- Remove duplicate status updates (keep the oldest one)
DELETE FROM status_updates a USING status_updates b
WHERE a.id > b.id 
AND a.batch_id = b.batch_id 
AND a.action_type = b.action_type;

-- Add unique constraint to prevent future duplicates
ALTER TABLE status_updates ADD CONSTRAINT unique_batch_action UNIQUE (batch_id, action_type);
