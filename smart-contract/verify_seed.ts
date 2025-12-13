import { Lucid, Blockfrost } from "npm:@lucid-evolution/lucid@latest";

// INSTRUCTIONS:
// 1. Install Deno (https://deno.com/)
// 2. Open terminal in this folder
// 3. Run: deno run -A verify_seed.ts

const BLOCKFROST_KEY = "YOUR_BLOCKFROST_KEY_HERE"; // Replace with your key temporarily for checking
const PROCESSOR_SECRET_SEED = "firm teach sample jacket cancel miss reject army daughter awesome dirt catalog birth wing fatigue desert present glow smooth false hold dry album gather";
// ^ Replace with the seed you put in Netlify

const PROCESSOR_WALLET_ADDRESS = "addr_test...";
// ^ Replace with the address you funded via Faucet

async function verify() {
    console.log("Initializing Lucid...");

    // Note: We don't need a real blockfrost key just to derive address from seed
    // But Lucid structure requires a provider. 
    // We can try to derive without connecting if we use lower level libs, 
    // but let's assume user fills this or we can skip provider for address derivation?
    // Lucid evolution might require provider. 

    // Let's use a dummy provider just to instantiate, or real one.
    const lucid = await Lucid(
        new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "previewOrPreprodKey"),
        "Preprod"
    );

    lucid.selectWallet.fromSeed(PROCESSOR_SECRET_SEED);

    const derivedAddress = await lucid.wallet().address();

    console.log("\n============================================");
    console.log("VERIFICATION RESULT");
    console.log("============================================");
    console.log(`Seed Derives To: ${derivedAddress}`);
    console.log("--------------------------------------------");
    console.log(`Funded Address : ${PROCESSOR_WALLET_ADDRESS}`);

    if (derivedAddress === PROCESSOR_WALLET_ADDRESS) {
        console.log("\n✅ MATCH! The seed corresponds to the funded address.");
        console.log("   Issue is likely 'Asset Trap' (insufficient ADA for fees despite balance).");
    } else {
        console.log("\n❌ MISMATCH! The seed generates a DIFFERENT address.");
        console.log("   The funds you sent to the 'Funded Address' are NOT accessible by this seed.");
        console.log("   The code is trying to spend from 'Seed Derives To' which likely has 0 ADA.");
    }
    console.log("============================================\n");
}

verify();
