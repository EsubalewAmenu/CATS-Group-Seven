-- Allow processors to update batches (e.g. status, weight)
CREATE POLICY "Processors can update batches"
    ON batches FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'processor'
        )
    );
