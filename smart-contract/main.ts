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

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });