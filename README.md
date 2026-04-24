# BFHL Hierarchy Processor

This is a full-stack solution for the SRM Full Stack Engineering Challenge. It parses hierarchical node relationships, builds tree structures, and detects cycles.

## Live Demo
[https://bfhl-challenge-yzpz.vercel.app/]

## Tech Stack
- Backend: Node.js, Express.js
- Frontend: HTML, CSS, Vanilla JavaScript
- Deployment: Vercel (Serverless Functions)

## Features
- Parses edge inputs (e.g., `A->B`) into JSON tree structures.
- Detects cyclic graphs and flags them.
- Handles multi-parent scenarios by discarding subsequent connections.
- Minimal frontend to interact with the API.
- Validates inputs and catches duplicate edges.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/YashRajcode04/bfhl_challenge.git
   cd bfhl_challenge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser.

## API Documentation

**Endpoint:** `POST /bfhl`
**Content-Type:** `application/json`

### Example Request
```json
{ 
  "data": ["A->B", "A->C", "B->D"] 
}
```

### Example Response
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

## Project Structure
- `api/bfhl.js`: Vercel serverless function entrypoint.
- `lib/processor.js`: Core algorithm for tree parsing.
- `public/`: Frontend files (HTML/CSS/JS).
- `server.js`: Express server for local development.
- `vercel.json`: Deployment configuration.
