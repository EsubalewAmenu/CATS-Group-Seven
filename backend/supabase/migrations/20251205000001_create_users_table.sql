-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'processor', 'consumer')),
    cardano_wallet_address TEXT UNIQUE,
    region TEXT,
    phone TEXT,
    profile_image_url TEXT,
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet address for faster lookups
CREATE INDEX idx_users_wallet ON users(cardano_wallet_address);
CREATE INDEX idx_users_role ON users(role);

COMMENT ON TABLE public.users IS 'All users in the supply chain (farmers, processors, consumers)';
