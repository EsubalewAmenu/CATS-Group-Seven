# How to Deploy the Smart Contract API to Deno Deploy

This API is built with Deno and Oak, and uses Lucid for Cardano interactions. It exposes `/mint` and `/transfer` endpoints.

## Prerequisite: GitHub Repository
Ensure this `smart-contract` folder is pushed to your GitHub repository.

## Option 1: Deploy via Deno Deploy Dashboard (Recommended)

1. **Sign Up/Login**: Go to [https://dash.deno.com](https://dash.deno.com) and sign in with your GitHub account.
2. **New Project**: Click **"New Project"**.
3. **Select Repository**:
   - Choose your repository: `EsubalewAmenu/CATS-Group-Seven` (or your fork).
   - Select the **branch** (e.g., `master`).
4. **Entry Point**:
   - Select the entry file: `smart-contract/main.ts`
   - **Important**: Make sure you select the file inside the `smart-contract` folder.
5. **Deploy**: Click **"Link & Deploy"**.

Deno Deploy will now build and deploy your API. It will give you a URL like `https://your-project-name.deno.dev`.

## Option 2: Update Existing Deployment

If you are using the existing project `thirsty-bat-79...`:
1. Go to the Deno Deploy dashboard.
2. Find the project.
3. Go to **Settings** > **Git Integration**.
4. Ensure the **Entry Point** is set correctly to `smart-contract/main.ts`.
   - *Note: If the entry point was previously just `main.ts` in the root (if you moved files), you must update this setting.*
5. Trigger a redeploy if necessary.

## Environment Variables

This API does **not** store secrets (like seed phrases) in the Deno Deploy environment variables significantly reduces security risks. Instead, it expects them to be responsible passed in the request body from the secure Netlify Function.

## Verify Deployment

Once deployed, test the health or an invalid endpoint to ensure the router is up:

```bash
curl https://your-project-name.deno.dev/
# Should probably 404 or show success depending on if a root route exists (currently no root route defined)
```

Test the transfer endpoint (it will fail without body, but should not be 404):
```bash
curl -X POST https://your-project-name.deno.dev/transfer
# Should return 500 or 400 "Missing required fields", NOT 404.
```

## Update Frontend

After deploying, if you got a **new URL**:
1. Go to `frontend/.env.example` (and your Netlify Site Settings).
2. Update `MINT_API_URL` and `TRANSFER_API_URL` to point to your new Deno Deploy URL.
   - Example: `https://your-new-project.deno.dev/mint`
