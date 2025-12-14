import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import {
  Lucid,
  Blockfrost,
  Data,
  fromText,
  applyParamsToScript,
  mintingPolicyToId,
  type Address,
  type MintingPolicy,
  type PolicyId,
  type Unit,
} from "npm:@lucid-evolution/lucid@latest";

const router = new Router();

router.post("/mint", async (context) => {
  try {
    const body = await context.request.body({ type: "json" }).value;

    if (!body.blockfrostKey || !body.secretSeed) {
      throw new Error("Missing Blockfrost Key or Secret Seed");
    }

    const lucid = await Lucid(
      new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", body.blockfrostKey),
      "Preprod"
    );

    lucid.selectWallet.fromSeed(body.secretSeed);

    const tokenName = body.tokenName;
    const tn = fromText(tokenName);

    const addr: Address = await lucid.wallet().address();
    console.log("Wallet Address:", addr);

    const utxos = await lucid.utxosAt(addr);

    let utxo = utxos.find(u => u.assets["lovelace"] > 5000000n && Object.keys(u.assets).length === 1);

    if (!utxo) {
      console.warn("⚠️ No pure ADA UTxO found. Using the first available (might be heavy).");
      utxo = utxos[0];
    }

    if (!utxo) throw new Error("No UTXOs available in wallet!");

    console.log("Selected Param UTXO:", utxo.txHash, "#", utxo.outputIndex);
    if (utxos.length === 0) throw new Error("No UTXOs");

    console.log("Selected Param UTXO:", utxo.txHash);

    const Params = Data.Tuple([Data.Bytes(), Data.Integer(), Data.Bytes()]);
    type Params = Data.Static<typeof Params>;

    const nftPolicy: MintingPolicy = {
      type: "PlutusV3",
      script: applyParamsToScript(
        body.cborHex,
        [
          utxo.txHash,
          BigInt(utxo.outputIndex),
          tn
        ],
        Params
      ),
    };

    const policyId: PolicyId = mintingPolicyToId(nftPolicy);
    const unit: Unit = policyId + tn;
    console.log("Minting Unit:", unit);

    const metadata = {
      [policyId]: {
        [tokenName]: body.metadata
      },
    };

    console.log("Building transaction...");
    let txBuilder = lucid.newTx()
      .mintAssets({ [unit]: 1n }, Data.void())
      .attach.MintingPolicy(nftPolicy)
      .attachMetadata(721, metadata)
      .collectFrom([utxo])
      .addSigner(addr);

    const tx = await txBuilder.complete();
    console.log("Transaction built successfully.");

    const signedTx = await tx.sign.withWallet().complete();
    console.log("Transaction signed.");

    const txHash = await signedTx.submit();
    console.log("Transaction submitted:", txHash);

    context.response.body = {
      status: "success",
      txHash,
      unit,
      policyId,
    };
  } catch (error) {
    console.error("FULL ERROR:", error); // This prints the stack trace if it fails again
    context.response.status = 500;
    context.response.body = { error: error.message };
  }
});

router.post("/transfer", async (context) => {
  try {
    const body = await context.request.body({ type: "json" }).value;

    if (!body.blockfrostKey || !body.secretSeed || !body.assetUnit) {
      throw new Error("Missing required fields: blockfrostKey, secretSeed, assetUnit");
    }

    const lucid = await Lucid(
      new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", body.blockfrostKey),
      "Preprod"
    );
    lucid.selectWallet.fromSeed(body.secretSeed);

    const walletAddress = await lucid.wallet().address();
    
    const finalRecipient = body.selfTransfer ? walletAddress : body.recipientAddress;

    if (!finalRecipient) {
        throw new Error("Recipient address is missing and selfTransfer is false");
    }

    const metadataLabel = 674;
    const metadataContent = body.metadata || { msg: ["Status Update", "Powered by EthioCoffee"] };

    console.log(`[${body.selfTransfer ? 'SELF-TRANSFER' : 'TRANSFER'}] ${body.assetUnit} -> ${finalRecipient}`);

    const MAX_RETRIES = 5;
    const RETRY_DELAY = 5000;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const tx = await lucid.newTx()
          .pay.ToAddress(finalRecipient, { [body.assetUnit]: 1n })
          .attachMetadata(metadataLabel, metadataContent)
          .complete();

        const signedTx = await tx.sign.withWallet().complete();
        const txHash = await signedTx.submit();
        
        await new Promise(res => setTimeout(res, 1000));
        
        console.log(`[SUCCESS] Tx Hash: ${txHash}`);

        context.response.body = {
          status: "success",
          txHash,
          message: body.selfTransfer ? "Status updated (self-transfer)" : "Asset transferred"
        };
        return;

      } catch (innerError) {
        const errString = JSON.stringify(innerError);

        if (errString.includes("BadInputsUTxO") || errString.includes("ValueNotConservedUTxO")) {
            console.warn("[WARNING] Double-spend detected. Blockfrost is lagging.");
            
            context.response.status = 429;
            context.response.body = {
                status: "retry_later",
                error: "Transaction pending. Your previous transaction is still processing. Please wait 30 seconds."
            };
            return;
        }

        // Only retry for actual "Not enough funds" (which might mean waiting for change)
        // or other network blips.
        if (i < MAX_RETRIES - 1) {
             console.log(`Attempt ${i + 1} failed: ${innerError.message || "Network error"}. Retrying in 5s...`);
             await new Promise(res => setTimeout(res, RETRY_DELAY));
        } else {
             // If we ran out of retries, throw to the global catcher
             throw innerError;
        }
      }
    }

  } catch (globalError) {
    console.error("[SERVER ERROR]", globalError);
    context.response.status = 500;
    context.response.body = { 
        status: "error", 
        message: globalError.message || "An unexpected error occurred" 
    };
  }
});


router.post("/split", async (context) => {
  const body = await context.request.body({ type: "json" }).value;
  if (!body.blockfrostKey || !body.secretSeed ) {
      throw new Error("Missing required fields");
  }

  const lucid = await Lucid(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", body.blockfrostKey),
    "Preprod"
  );

  lucid.selectWallet.fromSeed(body.secretSeed);

  // We created 10 smaller UTxOs of 50 ADA each
  // This allows 10 simultaneous transactions per block
  const addr: Address = await lucid.wallet().address();
  console.log("Wallet Address:", addr);

  const tx = await lucid.newTx()
    .pay.ToAddress(addr, { lovelace: 50000000n }) // 50 ADA
    .pay.ToAddress(addr, { lovelace: 50000000n })
    .pay.ToAddress(addr, { lovelace: 50000000n })
    .pay.ToAddress(addr, { lovelace: 50000000n })
    .pay.ToAddress(addr, { lovelace: 50000000n })
    .complete();

  const signedTx = await tx.sign.withWallet().complete();
  const txHash = await signedTx.submit();

  console.log(`Wallet split successful: ${txHash}`);
  context.response.body = {
    status: "success",
    message: "Wallet split successful",
    txHash,
    };
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });