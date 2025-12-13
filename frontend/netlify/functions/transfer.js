// Netlify Function to handle Cardano token transfers securely
// Transfers token to recipient address and updates metadata
// Version: 1.1

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Get all credentials from environment variables (same as mint)
    const TRANSFER_API_URL = process.env.TRANSFER_API_URL;
    const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY;
    const SECRET_SEED = process.env.SECRET_SEED;
    const PROCESSOR_WALLET_ADDRESS = process.env.PROCESSOR_WALLET_ADDRESS;

    // Validate all required environment variables
    if (!TRANSFER_API_URL || !BLOCKFROST_KEY || !SECRET_SEED || !PROCESSOR_WALLET_ADDRESS) {
        const missing = [];
        if (!TRANSFER_API_URL) missing.push('TRANSFER_API_URL');
        if (!BLOCKFROST_KEY) missing.push('BLOCKFROST_KEY');
        if (!SECRET_SEED) missing.push('SECRET_SEED');
        if (!PROCESSOR_WALLET_ADDRESS) missing.push('PROCESSOR_WALLET_ADDRESS');
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

        console.log('Transfer request:', { assetUnit, status, recipientAddress: PROCESSOR_WALLET_ADDRESS });

        const requestBody = {
            blockfrostKey: BLOCKFROST_KEY,
            secretSeed: SECRET_SEED,
            metadata: {
                status,
                description: description || '',
                note: note || ''
            },
            assetUnit,
            recipientAddress: PROCESSOR_WALLET_ADDRESS
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
                message: data.message || 'Transfer successful'
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
