import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

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