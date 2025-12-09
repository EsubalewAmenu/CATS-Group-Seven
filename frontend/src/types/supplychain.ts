// CIP-25 Metadata Standard (Label 721)
export interface CIP25Metadata {
  "721": {
    [policyId: string]: {
      [assetName: string]: {
        name: string;
        image: string;
        mediaType: string;
        description: string;
        project: string;
        origin: {
          farmer: string;
          region: string;
          elevation: string;
          gps: string;
          harvest_date: string;
        };
        specifications: {
          variety: string;
          process: string;
          initial_weight: string;
        };
        files: Array<{
          name: string;
          mediaType: string;
          src: string;
        }>;
      };
    };
  };
}

// Status Update Metadata Standard (Label 1001)
export interface StatusUpdateMetadata {
  "1001": {
    batch_id: string;
    action: string;
    timestamp: string;
    actor: {
      id: string;
      name: string;
    };
    data: {
      new_weight?: string;
      moisture_content?: string;
      cupping_score?: string;
      notes?: string;
      [key: string]: any;
    };
  };
}

// Application Types (Mapped from Metadata)
export interface Farmer {
  id: string;
  name: string;
  region: string;
  elevation: string;
  gps: string;
  walletAddress: string;
}

export interface Batch {
  id: string; // Asset Name (Hex decoded)
  batchNumber?: string; // Human readable ID
  policyId?: string;
  farmer: Farmer;
  cropType: 'coffee' | 'tea' | 'flowers';
  variety: string;
  initialWeight: number;
  currentWeight?: number;
  location: string;
  harvestDate: string;
  status: 'harvested' | 'processing' | 'exported' | 'retail';
  grade?: string;
  cuppingScore?: number;
  moistureContent?: string;

  // The raw metadata as it appears on-chain
  cip25Metadata?: CIP25Metadata;

  // The history of updates (Label 1001 transactions)
  journey: JourneyStep[];
}

export interface JourneyStep {
  action: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
  };
  location?: string;
  data?: {
    new_weight?: string;
    moisture_content?: string;
    cupping_score?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface HarvestData {
  cropType: 'coffee' | 'tea' | 'flowers';
  weight: number;
  variety: string;
  harvestDate: string;
  process: string;
  elevation: string;
  gps: string;
  farmerName: string;
  farmerPhotoUrl?: string;
}

export interface StatusUpdateData {
  batchId: string;
  action: string;
  newWeight?: number;
  moistureContent?: string;
  cuppingScore?: number;
  notes?: string;
}
