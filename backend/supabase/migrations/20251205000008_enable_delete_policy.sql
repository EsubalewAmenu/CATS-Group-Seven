-- Allow farmers to delete their own batches
CREATE POLICY "Farmers can delete own batches"
    ON batches FOR DELETE
    USING (farmer_id = auth.uid());
