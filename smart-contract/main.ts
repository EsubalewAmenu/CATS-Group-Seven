import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import {
  Lucid,
  Blockfrost,
  fromText,
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
    if (utxos.length === 0) throw new Error("No UTXOs");

    const utxo = utxos[0];
    console.log("Selected Param UTXO:", utxo.txHash);

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