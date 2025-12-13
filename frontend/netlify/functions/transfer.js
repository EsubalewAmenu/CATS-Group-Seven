// Netlify Function to handle Cardano token status updates securely
// Version: 3.0 - Centralized Custody: Token stays in minting wallet, metadata updates via self-transfer

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Get credentials from environment variables
    // CENTRALIZED CUSTODY: We only use the minting wallet (SECRET_SEED)
    const TRANSFER_API_URL = process.env.TRANSFER_API_URL;
    const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;
    const SECRET_SEED = process.env.SECRET_SEED; // Single wallet for all operations

    // Validate required environment variables
    const requiredVars = { TRANSFER_API_URL, BLOCKFROST_KEY, SECRET_SEED };
    const missing = Object.entries(requiredVars).filter(([_, v]) => !v).map(([k]) => k);

    if (missing.length > 0) {
        console.error('Missing environment variables:', missing);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Missing environment variables: ${missing.join(', ')}` }),
        };
    }

    try {
        const { assetUnit, status, description, note } = JSON.parse(event.body);

        if (!assetUnit || !status) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'assetUnit and status are required' }),
            };
        }

        console.log('Status update request (Centralized Custody):', { assetUnit, status });

        // CENTRALIZED CUSTODY: 
        // - Use SECRET_SEED for all operations
        // - recipientAddress is null/undefined - Deno API will do self-transfer
        const requestBody = {
            blockfrostKey: BLOCKFROST_KEY,
            secretSeed: SECRET_SEED,
            metadata: {
                status,
                description: description || '',
                note: note || '',
                timestamp: new Date().toISOString()
            },
            assetUnit,
            selfTransfer: true // Signal to Deno API to send to self
        };

        const response = await fetch(TRANSFER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log('Transfer API response:', response.status, responseText);

        if (!response.ok) {
            let errorMessage = responseText;
            try {
                const errorJson = JSON.parse(responseText);
                errorMessage = errorJson.error || errorJson.message || responseText;
            } catch {
                // Use raw text
            }
            return {
                statusCode: response.status,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Transfer API error: ${errorMessage}` }),
            };
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Invalid JSON response: ${responseText.substring(0, 200)}` }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: data.status,
                txHash: data.txHash,
                message: data.message || 'Status update successful'
            }),
        };
    } catch (error) {
        console.error('Transfer error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Server error: ${error.message}` }),
        };
    }
}
