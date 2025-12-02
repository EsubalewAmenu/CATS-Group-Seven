# ☕ smart-contract Module: Smart Contracts & Minting API

This directory contains the **Aiken** smart contract source code and the **Deno** API server used to mint Coffee NFTs.

## Tech Stack
- **Language:** Aiken (v1.1+)
- **Runtime:** Deno (v1.46+)
- **Library:** Lucid Evolution (@lucid-evolution/lucid)
- **Network:** Cardano Preprod

## Setup

1. **Install Dependencies:**
   Ensure Deno and Aiken are installed.

2. **Configuration:**
   The `main.ts` expects a JSON body containing:
   - `blockfrostKey`: Your Preprod project ID.
   - `secretSeed`: The mnemonic of the minting wallet.

3. **Build Contract:**
   ```bash
   aiken build
````

*This generates `plutus.json` containing the CBOR hex needed for the API.*

4.  **Run Server:**
    ```bash
    deno run --allow-net --allow-read --allow-env --allow-sys main.ts
    ```

## API Endpoints

### `POST /mint`

Mints a new Coffee NFT.

  - **Body:**
    ```json
    {
      "blockfrostKey": "preprod...",
      "secretSeed": "your seed phrase...",
      "tokenName": "MyAikenNFT",
      "metadata": { "name": "Aiken NFT #1", "image": "ipfs://..." },
      "cborHex": "5908..." // The 'compiledCode' string from aiken's plutus.json
    }
    ```