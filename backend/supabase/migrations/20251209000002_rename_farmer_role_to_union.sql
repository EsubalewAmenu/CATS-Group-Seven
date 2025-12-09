-- Rename 'farmer' role to 'union' to reflect the new business model
-- Union employees register batches on behalf of farmers

-- Drop the existing constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the updated constraint with 'union' instead of 'farmer'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('union', 'processor', 'consumer'));

-- Update any existing farmer records to union
UPDATE public.users SET role = 'union' WHERE role = 'farmer';

-- Update comment
COMMENT ON TABLE public.users IS 'All users in the supply chain (union employees, processors, consumers)';
