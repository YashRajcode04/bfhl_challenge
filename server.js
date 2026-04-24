const express = require("express");
const cors = require("cors");
const { processData } = require("./lib/processor");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// POST /bfhl — main API endpoint
app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body || {};
    const result = processData(data);
    return res.json(result);
  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /bfhl — health check
app.get("/bfhl", (_req, res) => {
  res.json({ operation_code: 1 });
});

app.listen(PORT, () => {
  console.log(`BFHL API running on http://localhost:${PORT}`);
});
