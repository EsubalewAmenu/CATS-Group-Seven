import { supabase } from '../lib/supabase';
import { Batch, HarvestData, StatusUpdateData, JourneyStep, Farmer } from '../types/supplychain';
import { Database } from '@backend/types/supabase';

// Error types
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Helper to map Supabase Batch to App Batch
function mapSupabaseBatchToAppBatch(
    batch: Database['public']['Tables']['batches']['Row'] & {
        users: Database['public']['Tables']['users']['Row'];
        status_updates: Database['public']['Tables']['status_updates']['Row'][];
    }
): Batch {
    // Sort status updates by creation time
    const sortedUpdates = batch.status_updates.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const journey: JourneyStep[] = sortedUpdates.map(update => ({
        action: update.action_type,
        timestamp: update.created_at,
        actor: {
            id: update.actor_id,
            name: update.actor_role, // Ideally we'd join the actor's name here too, but role works for now or we need another join
        },
        location: update.location ? JSON.stringify(update.location) : undefined,
        data: update.update_data as any,
    }));

    const farmer: Farmer = {
        id: batch.users.id,
        name: (batch as any).farmer_name || batch.users.full_name,
        region: '',
        elevation: batch.elevation || '',
        gps: (batch.location as any)?.gps_string || '',
        walletAddress: batch.users.cardano_wallet_address || '',
    };

    return {
        id: batch.id,
        batchNumber: batch.batch_number,
        farmer,
        cropType: batch.crop_type as any,
        variety: batch.variety || '',
        initialWeight: batch.initial_weight,
        currentWeight: batch.current_weight,
        location: (batch.location as any)?.region || '',
        harvestDate: batch.harvest_date,
        status: batch.status as any,
        grade: batch.grade || undefined,
        journey,
    };
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Fetch all batches
 */
export async function getAllBatches(): Promise<Batch[]> {
    const { data, error } = await supabase
        .from('batches')
        .select(`
            *,
            users (*),
            status_updates (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        throw new ApiError(error.message, parseInt(error.code), error.details);
    }

    return (data as any[]).map(mapSupabaseBatchToAppBatch);
}

/**
 * Fetch a single batch by ID or Batch Number
 */
export async function getBatchById(idOrNumber: string): Promise<Batch | undefined> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

    let query = supabase
        .from('batches')
        .select(`
            *,
            users (*),
            status_updates (*)
        `);

    if (isUuid) {
        query = query.eq('id', idOrNumber);
    } else {
        query = query.eq('batch_number', idOrNumber);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw new ApiError(error.message, parseInt(error.code), error.details);
    }

    return mapSupabaseBatchToAppBatch(data as any);
}

/**
 * Delete a batch
 */
export async function deleteBatch(id: string): Promise<void> {
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) {
        throw new ApiError(error.message, parseInt(error.code), error.details);
    }
}

/**
 * Create a new batch
 */
export async function createBatch(harvestData: HarvestData): Promise<Batch> {
    // 1. Get the current user (Farmer)
    const { data: { user } } = await supabase.auth.getUser();
    let farmerId = user?.id;

    if (!farmerId) {
        // Fallback for testing/demo without login (might fail RLS)
        const { data: farmers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'farmer')
            .limit(1);
        farmerId = (farmers as any)?.[0]?.id;
    }

    if (!farmerId) {
        throw new ApiError('No farmer account found to create batch');
    }

    // 2. Create the batch
    const { data: batch, error } = await supabase
        .from('batches')
        .insert({
            farmer_id: farmerId,
            batch_number: `BATCH-${Date.now()}`, // Fallback if DB function fails or just to be safe
            crop_type: harvestData.cropType,
            initial_weight: harvestData.weight,
            current_weight: harvestData.weight,
            variety: harvestData.variety,
            process_method: harvestData.process,
            elevation: harvestData.elevation,
            location: {
                gps_string: harvestData.gps
            },
            farmer_name: harvestData.farmerName,
            farmer_photo_url: harvestData.farmerPhotoUrl || null,
            qr_code: `QR-${Date.now()}`, // Simple generation
            harvest_date: new Date().toISOString(), // Or harvestData.harvestDate if provided
            status: 'harvested'
        } as any)
        .select()
        .single();

    if (error) {
        throw new ApiError(error.message, parseInt(error.code), error.details);
    }

    // 3. Create initial status update (Harvested)
    await supabase.from('status_updates').insert({
        batch_id: (batch as any).id,
        actor_id: farmerId,
        action_type: 'HARVESTED',
        actor_role: 'union',
        update_data: { weight: harvestData.weight },
        notes: 'Initial harvest'
    } as any);

    // Return the full batch object
    const newBatch = await getBatchById((batch as any).id);
    if (!newBatch) throw new ApiError('Failed to retrieve created batch');

    return newBatch;
}

/**
 * Update batch status
 */
export async function updateBatchStatus(updateData: StatusUpdateData): Promise<Batch> {
    const { batchId, action, ...data } = updateData;

    // 1. Get current user (Actor)
    const { data: { user } } = await supabase.auth.getUser();
    let actorId = user?.id;
    let actorRole = 'processor'; // Default or fetch from profile

    if (!actorId) {
        // Fallback
        const { data: actors } = await supabase
            .from('users')
            .select('id, role')
            .eq('role', 'processor')
            .limit(1);

        const fallbackActor = (actors as any)?.[0];
        if (fallbackActor) {
            actorId = fallbackActor.id;
            actorRole = fallbackActor.role;
        }
    } else {
        // Fetch role for current user
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', actorId)
            .single();
        if (profile) {
            actorRole = (profile as any).role;
        }
    }

    if (!actorId) throw new ApiError('No actor found to perform update');

    // 2. Create status update
    const { error: updateError } = await supabase
        .from('status_updates')
        .insert({
            batch_id: batchId,
            actor_id: actorId,
            action_type: action as any,
            actor_role: actorRole,
            update_data: data,
            notes: data.notes
        } as any);

    if (updateError) {
        throw new ApiError(updateError.message, parseInt(updateError.code), updateError.details);
    }

    // 3. Update batch status and weight if needed
    const batchUpdates: Database['public']['Tables']['batches']['Update'] = {};

    // Map action to batch status
    const statusMap: Record<string, string> = {
        'PROCESSING_STARTED': 'processing',
        'PROCESSING_COMPLETE': 'processed',
        'IN_TRANSIT': 'in_transit',
        'DELIVERED': 'delivered',
        'RETAIL_READY': 'retail'
    };

    if (statusMap[action]) {
        batchUpdates.status = statusMap[action] as Database['public']['Tables']['batches']['Update']['status'];
    }

    if (data.newWeight) {
        batchUpdates.current_weight = data.newWeight;
    }

    if (Object.keys(batchUpdates).length > 0) {
        // Cast to any to bypass strict type check on update method
        const { error: batchError } = await (supabase
            .from('batches') as any)
            .update(batchUpdates)
            .eq('id', batchId);

        if (batchError) {
            throw new ApiError(batchError.message, parseInt(batchError.code), batchError.details);
        }
    }

    // Return updated batch
    const updatedBatch = await getBatchById(batchId);
    if (!updatedBatch) throw new ApiError('Failed to retrieve updated batch');

    return updatedBatch;
}

// ============================================================================
// Health Check
// ============================================================================

export async function healthCheck(): Promise<{ status: string; message?: string }> {
    const { error } = await supabase.from('batches').select('id').limit(1);
    if (error) {
        return { status: 'error', message: error.message };
    }
    return { status: 'ok', message: 'Supabase connection established' };
}

/**
 * Record blockchain minting metadata
 */
export async function recordMinting(
    batchId: string,
    policyId: string,
    assetName: string,
    metadata: any
): Promise<void> {
    // Check if already minted
    const { data: existing, error: findError } = await supabase
        .from('blockchain_metadata')
        .select('id')
        .eq('batch_id', batchId)
        .single();

    if (existing) {
        throw new ApiError('Batch is already minted');
    }

    // Ignore not found error
    if (findError && findError.code !== 'PGRST116') {
        throw new ApiError(findError.message, parseInt(findError.code), findError.details);
    }

    const { error } = await supabase
        .from('blockchain_metadata')
        .insert({
            batch_id: batchId,
            policy_id: policyId,
            asset_name: assetName,
            asset_name_hex: assetName.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
            mint_transaction_hash: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Mock TX Hash for now
            cip25_metadata: metadata
        } as any);

    if (error) {
        throw new ApiError(error.message, parseInt(error.code), error.details);
    }
}
