# BFHL Hierarchy Processor - SRM Full Stack Challenge

A complete Full Stack solution for parsing hierarchical node relationships, building tree structures, and detecting cycles. Built for the SRM Full Stack Engineering Challenge.

## 🚀 Live Demo
**[Insert Your Vercel URL Here]** *(e.g., https://bfhl-challenge-yzpz.vercel.app)*

## 🛠️ Tech Stack
This project strictly follows the preferred Node.js / JavaScript stack without unnecessary heavy frameworks:
*   **Backend:** Node.js, Express.js
*   **Frontend:** Plain HTML, CSS, Vanilla JavaScript
*   **Deployment:** Vercel (using Vercel Serverless Functions)

## 🌟 Features
*   **Tree Construction:** Parses edges (e.g., `A->B`) into hierarchical JSON tree structures.
*   **Cycle Detection:** Automatically detects cyclic graphs (e.g., `A->B, B->C, C->A`) and flags them without infinite loops.
*   **Multi-Parent Handling:** Safely handles cases where a node has multiple parents (discarding subsequent parent connections).
*   **Minimal & Responsive UI:** Clean, lightweight frontend to test the API with real-time tree visualizations.
*   **Robust Validation:** Catches and logs invalid inputs and duplicate edges.

## ⚙️ Running Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YashRajcode04/bfhl_challenge.git
    cd bfhl_challenge
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the local Express server**
    ```bash
    npm start
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:3000` to interact with the UI.

## 📡 API Specification

**Endpoint:** `POST /bfhl`
**Content-Type:** `application/json`

### Request Body
```json
{ 
  "data": ["A->B", "A->C", "B->D"] 
}
```

### Response
```json
{
  "user_id": "yashraj_04092004",
  "email_id": "yr5924@srmist.edu.in",
  "college_roll_number": "RA2311027010081",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": { "D": {} }, "C": {} } },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## 📂 Project Structure
```text
bfhl_challenge/
├── api/
│   └── bfhl.js            # Vercel serverless function entrypoint
├── lib/
│   └── processor.js       # Core logic for tree parsing & validation
├── public/
│   ├── index.html         # Frontend UI
│   ├── script.js          # Frontend logic & API fetching
│   └── style.css          # UI styling
├── server.js              # Express server for local development
├── vercel.json            # Deployment routing configuration
└── package.json           # Dependencies and scripts
```
