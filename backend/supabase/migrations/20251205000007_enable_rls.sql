-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_metadata ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Anyone can read user profiles (public info)
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Batches table policies
-- Everyone can view batches (for consumer verification)
CREATE POLICY "Batches are viewable by everyone"
    ON batches FOR SELECT
    USING (true);

-- Only farmers can create batches
CREATE POLICY "Farmers can create batches"
    ON batches FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'farmer'
        )
    );

-- Farmers can update their own batches
CREATE POLICY "Farmers can update own batches"
    ON batches FOR UPDATE
    USING (farmer_id = auth.uid());

-- Status updates policies
-- Everyone can view status updates
CREATE POLICY "Status updates are viewable by everyone"
    ON status_updates FOR SELECT
    USING (true);

-- Authenticated users can create status updates
CREATE POLICY "Authenticated users can create status updates"
    ON status_updates FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Blockchain metadata policies
-- Everyone can view blockchain metadata
CREATE POLICY "Blockchain metadata is viewable by everyone"
    ON blockchain_metadata FOR SELECT
    USING (true);

-- Only authenticated users can insert blockchain metadata
CREATE POLICY "Authenticated users can create blockchain metadata"
    ON blockchain_metadata FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
