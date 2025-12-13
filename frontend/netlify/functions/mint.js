// Netlify Function to handle Cardano minting securely
// Secrets (SECRET_SEED, BLOCKFROST_KEY, CBOR_HEX) are only accessible server-side

export async function handler(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Get secrets from environment (NOT prefixed with VITE_)
    const MINT_API_URL = process.env.MINT_API_URL;
    const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;
    const SECRET_SEED = process.env.SECRET_SEED;
    const CBOR_HEX = process.env.CBOR_HEX;

    // Validate all required environment variables are configured
    if (!MINT_API_URL || !BLOCKFROST_KEY || !SECRET_SEED || !CBOR_HEX) {
        const missing = [];
        if (!MINT_API_URL) missing.push('MINT_API_URL');
        if (!BLOCKFROST_KEY) missing.push('BLOCKFROST_KEY');
        if (!SECRET_SEED) missing.push('SECRET_SEED');
        if (!CBOR_HEX) missing.push('CBOR_HEX');
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: `Missing environment variables: ${missing.join(', ')}`
            }),
        };
    }

    try {
        // Parse request body
        const { tokenName, metadata } = JSON.parse(event.body);

        if (!tokenName || !metadata) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'tokenName and metadata are required' }),
            };
        }

        // Build request payload for the minting API
        const requestBody = {
            blockfrostKey: BLOCKFROST_KEY,
            secretSeed: SECRET_SEED,
            tokenName,
            metadata,
            cborHex: CBOR_HEX,
        };

        // Call the external minting API
        const response = await fetch(MINT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `Minting API error: ${errorText}`
                }),
            };
        }

        const data = await response.json();

        // Return success response (without exposing secrets)
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: data.status,
                txHash: data.txHash,
                unit: data.unit,
                policyId: data.policyId,
            }),
        };
    } catch (error) {
        console.error('Minting error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `Server error: ${error.message}`
            }),
        };
    }
}
