Farm-to-Market Traceability on Cardano
System Title: Ethio-Origin
Theme: Supply Chain Transparency & Regenerative Agriculture
Location: Ethiopia
Blockchain: Cardano

1. Executive Summary
East African countries produce some of the world’s finest coffee, tea, and flowers, yet the supply chain remains opaque. This lack of transparency leads to diminished income for farmers, fraud in the supply chain, and a lack of trust for the end consumer.
Ethio-Origin is a blockchain-based Minimum Viable Product (MVP) designed to track produce from harvest to retail. By utilizing the Cardano blockchain, we create an immutable record of origin, quality, and handling. This system empowers farmers to prove the value of their crop, ensures exporters are compliant, and allows consumers to verify the story behind their purchase via a simple QR code scan.

2. Problem Statement
The current agricultural supply chain in Ethiopia and Kenya faces three critical bottlenecks:
Information Asymmetry: Farmers in regions like Guji or Sidama often cannot prove the premium quality of their harvest to international buyers, forcing them to accept lower commodity prices.
Supply Chain Leakage & Fraud: High-grade coffee is often mixed with lower-grade beans during transit (co-mingling), or origin labels are forged.
Consumer Disconnect: End-buyers want to support ethical farming but lack verifiable data to ensure their money supports the actual producer.

3. The Solution
We propose a decentralized application (dApp) built on Cardano that tracks the lifecycle of a product batch.
Tokenization: Each batch of harvest (e.g., 50kg of Red Cherry Coffee) is minted as a native asset (NFT) on the blockchain.
Immutable History: Every handover (Farmer -> Washing Station -> Exporter-> Retailer) is recorded as a transaction on-chain.
Consumer Verification: A public-facing interface allows anyone to scan the final product and view the entire journey on a map.
Key Impact Goals:
Increase Farmer Income: By proving provenance (e.g., "Single Origin Grade 1"), farmers can negotiate better rates.
Eliminate Fraud: Immutable records prevent tampering with harvest dates or grading certifications.
Direct Tipping: Enable consumers to send a "tip" (in ADA) directly to the farmer’s wallet.

4. Technical Architecture (Hackathon Stack)
We will build a lightweight, functional MVP using the following stack:
A. The Blockchain Layer (Cardano)
Network: Cardano Pre-prod Testnet.
Asset Standard: Native Tokens (representing the physical batch).
Data Storage: Transaction Metadata (CIP-25). We will attach JSON data to transactions to log status updates (e.g., "Washed," "Dried," "Shipped") without needing complex smart contracts for the MVP.
B. Data Storage (Off-Chain)
MetaData: used to store text information about the batch, farmer, status and some other related information.
Future plan
IPFS (InterPlanetary File System): used to store heavy media, such as photos of the harvest and quality certificates. Only the hash (link) is stored on-chain.
C. Frontend (User Interface)
Framework: Python or React Native for a mobile-first experience.
Features:
Simple Input Forms: For farmers/processors to log data.
QR Scanner: To read batch IDs.
Offline Mode: Data caches locally and syncs when the internet is available (crucial for rural Ethiopia).
5. User Journey (The Workflow)
Step 1: The Harvest (Farmer)
Farmer logs into the app/platform.
Inputs: Crop Type (Coffee), Weight (100kg), Location (GPS).
Action: System mints a "Batch Token" and generates a temporary QR tag for the bags.
Step 2: Processing (Washing Station)
Processor scans the Farmer's QR tag.
Inputs: Washing Method (Natural/Washed), Grade Assigned.
Action: System updates the metadata on the token.
Step 3: Logistics (Exporter)
Transporter scans the batch.
Action: App logs the timestamp and transfer of custody.
Step 4: The Consumer Experience
Consumer buys the coffee in a supermarket (or cafe).
Scans the QR code on the bag.
Result: A web page opens showing a map of the farm in Ethiopia, the photo of the farmer, and a "Verified Organic" checkmark.

6. Implementation Plan (Hackathon Timeline)
Day 1: Backend & Smart Contract
Set up Cardano wallet integration (Aiken with MeshJS or Lucid).
Script the "Minting Policy" for the assets.
Define the Metadata JSON standard.
Day 2: Frontend & Integration
Build the 3 key screens: Farmer Input, Logistics Scan, Consumer View.
Connect the frontend to the Cardano testnet.
Day 3: Testing & Pitch Prep
Run a full cycle test (Create -> Transfer -> Scan).
Design the presentation deck.
Demo Prop: Create a physical coffee bag with a printed QR code for the judges.
7. Team Roles
Blockchain Developer: Handles the minting scripts, wallet connection, and metadata structure.
Frontend Developer: Builds the mobile/web interface and QR scanning logic.
UI/UX Designer: Designs the "Consumer View" to look appealing and trustworthy.
Project Manager/Pitcher: Handles the slide deck, the business case, and the presentation.


This is the JSON Metadata Schema we need.
On Cardano, metadata is attached to a transaction. For a supply chain, we have two types of data:
The "Birth" Certificate (CIP-25): Created when we first mint the token (The Harvest).
The "Passport Stamps" (General Metadata): Created when the product moves (Processing, Transport).

1. The "Harvest" Schema (CIP-25 Standard)
We use this when the Farmer first creates the batch.
This data lives on the token forever. It follows the CIP-25 standard (Label 721) so it shows up beautifully on Cardano wallets and explorers (like Pool.pm).
JSON
{
  "721": {
    "<INSERT_POLICY_ID_HERE>": {
      "<INSERT_ASSET_NAME_HEX>": {
        "name": "Guji Highlands Grade 1 - Batch #402",
        "image": "link to our platform or ipfs://<IPFS_HASH_OF_COFFEE_BAG_IMAGE>",
        "mediaType": "image/jpeg",
        "description": "Premium Arabica harvested from the Oromia region.",
        "project": "Ethio-Origin",
        "origin": {
          "farmer": "Kebede Alazar",
          "region": "Guji Zone, Oromia",
          "elevation": "2100m",
          "gps": "5.8500° N, 39.0500° E",
          "harvest_date": "2025-11-28"
        },
        "specifications": {
          "variety": "Heirloom",
          "process": "Natural (Sun Dried)",
          "initial_weight": "100kg"
        },
        "files": [
          {
            "name": "Farmer Photo",
            "mediaType": "image/jpeg",
            "src": "link to our platform or ipfs://<IPFS_HASH_OF_FARMER_PHOTO>"
          },
          {
            "name": "Organic Certificate",
            "mediaType": "application/pdf",
            "src": "link to our platform or ipfs://<IPFS_HASH_OF_CERT_PDF>"
          }
        ]
      }
    }
  }
}


👨‍💻 Developer Note:
Replace <INSERT_POLICY_ID_HERE> with the Policy ID generated by your script.
Replace <INSERT_ASSET_NAME_HEX> with the hex-encoded name of the token (e.g., EthioCoffee402).
Images: For now we’ll use a user profile image link from our platform, but in the future we must upload the images to IPFS first (use Pinata for a free account) and paste the ipfs://... link here.

2. The "Status Update" Schema (General Metadata)
Use this when the Coffee moves (e.g., Washing Station -> Exporter).
We don't mint a new token here; we just send a tiny amount of ADA (minUTXO) to the next wallet with this metadata attached. This creates the "Audit Trail."
Label: We use a custom label (e.g., 1001) to separate this from the minting data.
JSON
{
  "1001": {
    "batch_id": "EthioCoffee402",
    "action": "PROCESSING_COMPLETE",
    "timestamp": "2025-11-30T14:00:00Z",
    "actor": {
      "id": "Washing_Station_05",
      "name": "Dimtu Tero Mill"
    },
    "data": {
      "new_weight": "85kg",
      "moisture_content": "11.5%",
      "cupping_score": "88.5",
      "notes": "Dried on raised beds for 21 days."
    }
  }
}
