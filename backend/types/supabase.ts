export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      batches: {
        Row: {
          id: string
          farmer_id: string
          batch_number: string
          status: 'harvested' | 'processing' | 'processed' | 'in_transit' | 'delivered' | 'retail'
          crop_type: string
          initial_weight: number
          current_weight: number
          variety: string | null
          process_method: string | null
          grade: string | null
          elevation: string | null
          location: Json
          qr_code: string
          harvest_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          batch_number?: string
          status?: 'harvested' | 'processing' | 'processed' | 'in_transit' | 'delivered' | 'retail'
          crop_type: string
          initial_weight: number
          current_weight: number
          variety?: string | null
          process_method?: string | null
          grade?: string | null
          elevation?: string | null
          location: Json
          qr_code: string
          harvest_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          batch_number?: string
          status?: 'harvested' | 'processing' | 'processed' | 'in_transit' | 'delivered' | 'retail'
          crop_type?: string
          initial_weight?: number
          current_weight?: number
          variety?: string | null
          process_method?: string | null
          grade?: string | null
          elevation?: string | null
          location?: Json
          qr_code?: string
          harvest_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      status_updates: {
        Row: {
          id: string
          batch_id: string
          actor_id: string
          action_type: 'HARVESTED' | 'PROCESSING_STARTED' | 'PROCESSING_COMPLETE' | 'QUALITY_CHECKED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETAIL_READY'
          actor_role: string
          update_data: Json | null
          notes: string | null
          transaction_hash: string | null
          location: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          actor_id: string
          action_type: 'HARVESTED' | 'PROCESSING_STARTED' | 'PROCESSING_COMPLETE' | 'QUALITY_CHECKED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETAIL_READY'
          actor_role: string
          update_data?: Json | null
          notes?: string | null
          transaction_hash?: string | null
          location?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          actor_id?: string
          action_type?: 'HARVESTED' | 'PROCESSING_STARTED' | 'PROCESSING_COMPLETE' | 'QUALITY_CHECKED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETAIL_READY'
          actor_role?: string
          update_data?: Json | null
          notes?: string | null
          transaction_hash?: string | null
          location?: Json | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string
          role: 'farmer' | 'processor' | 'consumer'
          cardano_wallet_address: string | null
          region: string | null
          phone: string | null
          profile_image_url: string | null
          profile_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          full_name: string
          role: 'farmer' | 'processor' | 'consumer'
          cardano_wallet_address?: string | null
          region?: string | null
          phone?: string | null
          profile_image_url?: string | null
          profile_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string
          role?: 'farmer' | 'processor' | 'consumer'
          cardano_wallet_address?: string | null
          region?: string | null
          phone?: string | null
          profile_image_url?: string | null
          profile_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      blockchain_metadata: {
        Row: {
          id: string
          batch_id: string
          policy_id: string
          asset_name: string
          asset_name_hex: string
          mint_transaction_hash: string
          cip25_metadata: Json
          ipfs_hash: string | null
          ipfs_metadata: Json | null
          minted_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          policy_id: string
          asset_name: string
          asset_name_hex: string
          mint_transaction_hash: string
          cip25_metadata: Json
          ipfs_hash?: string | null
          ipfs_metadata?: Json | null
          minted_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          policy_id?: string
          asset_name?: string
          asset_name_hex?: string
          mint_transaction_hash?: string
          cip25_metadata?: Json
          ipfs_hash?: string | null
          ipfs_metadata?: Json | null
          minted_at?: string
        }
      }
    }
    Views: {
      [_: string]: {
        Row: {
          [key: string]: Json
        }
      }
    }
    Functions: {
      [_: string]: {
        Args: {
          [key: string]: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_: string]: string
    }
  }
}