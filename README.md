# ☕ CATS Group Seven - Coffee Supply Chain dApp

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cardano](https://img.shields.io/badge/Blockchain-Cardano-blue)
![Aiken](https://img.shields.io/badge/Smart_Contracts-Aiken_v1.1+-purple)
![Deno](https://img.shields.io/badge/Runtime-Deno-black)

Welcome to the **CATS Group Seven** repository. This project is a decentralized application (dApp) built on the Cardano blockchain, designed to tokenize and track assets (Coffee) using advanced Plutus V3 smart contracts and a parameterized minting policy.

## 📂 Project Structure

This repository is organized into three main modules. Click on the folder names to navigate to their specific documentation.

```
CATS-Group-Seven/
├── 📂 smart-contract/          # Smart Contracts (Aiken) & Minting API (Deno/Lucid)
├── 📂 frontend/        # Web User Interface (React/Next.js)
└── 📂 backend/         # General Backend Services & Database
````

-----

## 🏗️ Modules Overview

### 1\. smart-contract (Smart Contracts & Minting API)

This is the core blockchain component of the application. It handles the logic for creating unique NFTs that represent coffee assets.

  * **Tech Stack:** Aiken (Smart Contracts), Deno (Runtime), Lucid Evolution (Off-chain transactions).
  * **Key Features:**
      * **Plutus V3 Support:** Utilizing the latest Cardano ledger features.
      * **One-Shot Minting:** A parameterized minting policy that guarantees an NFT is unique by consuming a specific UTXO during minting.
      * **REST API:** A Deno-based API server that handles minting requests, metadata attachment, and transaction submission.

### 2\. Frontend (Detail coming soon)

The user interface for interacting with the dApp.

  * **Tech Stack:** *[React, Next.js, Tailwind CSS ...]*
  * **Key Features:**
      * Dashboard for viewing Coffee assets.
      * Forms for initiating minting transactions.

### 3\. Backend (Detail coming soon)

The off-chain infrastructure supporting the frontend and managing non-blockchain data.

  * **Tech Stack:** *[Insert Tech, e.g., Node.js, Express, PostgreSQL, or Python ...]*
  * **Key Features:**
      * User authentication.
      * Caching blockchain data.
      * Business logic processing.

-----

## 🚀 Getting Started

### Prerequisites

To run this project locally, ensure you have the following installed:

  * **Deno:** v1.40+ (for the Coffee API)
  * **Aiken:** v1.1.0+ (for compiling contracts)
  * **Node.js:** (for Frontend/Backend modules)
  * **Git:** Version control

### Installation

1.  **Clone the repository**

    ```bash
    git clone [git@github.com:EsubalewAmenu/CATS-Group-Seven.git](git@github.com:EsubalewAmenu/CATS-Group-Seven.git)
    cd CATS-Group-Seven
    ```

2.  **Setup the Smart Contract & Minting Server**
    Navigate to the smart-contract directory to build the contracts and start the API.

    ```bash
    cd smart-contract
    # Build the Aiken contract
    aiken build
    # Start the Deno API server
    deno run --allow-net --allow-read --allow-env --allow-sys main.ts
    ```

    *See the [smart-contract/README.md](https://github.com/EsubalewAmenu/CATS-Group-Seven/blob/master/smart-contract/README.md) for detailed environment variable setup (Blockfrost Keys, Seeds).*

3.  **Setup Frontend & Backend**
    *Please refer to the specific README files in the `frontend` and `backend` directories for their installation steps.*

-----

## 🔗 Architecture

The system follows a 3-tier architecture integrated with the Cardano Blockchain:

1.  **Client:** The `frontend` sends requests to the `backend` and the `smart-contract` minting service.
2.  **Minting Service (`smart-contract` folder):**
      * Receives a request with token details.
      * Compiles/Loads the Aiken Plutus V3 script.
      * Parameters are applied (UTXO + Token Name) to ensure uniqueness.
      * Constructs a transaction using **Lucid Evolution**.
      * Submits the transaction to the Preprod network via Blockfrost.
3.  **Blockchain:** Validates the policy and records the asset on the ledger.

-----

## 🤝 Contributors

**CATS Group Seven Team:**

  * Esubalew Amenu
  * please team members, add your name here*

-----

## 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).