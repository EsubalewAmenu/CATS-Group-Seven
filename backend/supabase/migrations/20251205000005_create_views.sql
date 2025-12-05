-- View: Batch with Farmer Details
CREATE VIEW batch_details AS
SELECT 
    b.*,
    u.full_name AS farmer_name,
    u.cardano_wallet_address AS farmer_wallet,
    u.region AS farmer_region,
    u.profile_image_url AS farmer_photo,
    bm.policy_id,
    bm.asset_name,
    bm.mint_transaction_hash,
    COUNT(su.id) AS update_count
FROM batches b
LEFT JOIN users u ON b.farmer_id = u.id
LEFT JOIN blockchain_metadata bm ON b.id = bm.batch_id
LEFT JOIN status_updates su ON b.id = su.batch_id
GROUP BY b.id, u.id, bm.id;

COMMENT ON VIEW batch_details IS 'Complete batch information with farmer and blockchain data';
