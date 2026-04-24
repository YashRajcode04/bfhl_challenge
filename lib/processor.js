/**
 * Core processing logic for the BFHL API.
 * Handles validation, deduplication, tree construction, cycle detection, and summary generation.
 */

// ─── Configuration ──────────────────────────────────────────────────────────
// UPDATE THESE WITH YOUR ACTUAL CREDENTIALS
const USER_ID = "yashraj_04092004";
const EMAIL_ID = "yr5924@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2311027010081";

// ─── Validation ─────────────────────────────────────────────────────────────
const EDGE_REGEX = /^([A-Z])->([A-Z])$/;

function validateEntry(raw) {
  const trimmed = (typeof raw === "string" ? raw : String(raw)).trim();
  const match = trimmed.match(EDGE_REGEX);
  if (!match) return { valid: false, original: trimmed };
  const [, parent, child] = match;
  if (parent === child) return { valid: false, original: trimmed }; // self-loop
  return { valid: true, parent, child, edge: `${parent}->${child}` };
}

// ─── Main processor ─────────────────────────────────────────────────────────
function processData(data) {
  if (!Array.isArray(data)) data = [];

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const validEdges = []; // { parent, child }

  // 1. Validate & deduplicate
  for (const entry of data) {
    const result = validateEntry(entry);
    if (!result.valid) {
      invalidEntries.push(result.original);
      continue;
    }
    if (seenEdges.has(result.edge)) {
      if (!duplicateEdges.includes(result.edge)) duplicateEdges.push(result.edge);
      continue;
    }
    seenEdges.add(result.edge);
    validEdges.push({ parent: result.parent, child: result.child });
  }

  // 2. Multi-parent handling — first parent wins, rest silently discarded
  const parentOf = {};   // child  → parent
  const childrenOf = {}; // parent → [child, …]
  const allNodes = new Set();

  for (const { parent, child } of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);
    if (parentOf[child] !== undefined) continue; // discard silently
    parentOf[child] = parent;
    if (!childrenOf[parent]) childrenOf[parent] = [];
    childrenOf[parent].push(child);
  }

  // 3. Connected components (undirected, using effective edges only)
  const adj = {};
  for (const n of allNodes) adj[n] = [];
  for (const [child, parent] of Object.entries(parentOf)) {
    adj[parent].push(child);
    adj[child].push(parent);
  }

  const visited = new Set();
  const components = [];
  const sortedNodes = [...allNodes].sort();

  for (const start of sortedNodes) {
    if (visited.has(start)) continue;
    const comp = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const cur = queue.shift();
      comp.push(cur);
      for (const nb of adj[cur]) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      }
    }
    components.push(comp.sort());
  }

  // 4. Build hierarchies
  const hierarchies = [];

  for (const comp of components) {
    const roots = comp.filter(n => parentOf[n] === undefined);

    if (roots.length === 0) {
      // Pure cycle — every node is a child
      hierarchies.push({ root: comp[0], tree: {}, has_cycle: true });
    } else {
      const root = roots.sort()[0];

      // Build nested tree object
      function buildTree(node) {
        const obj = {};
        const kids = (childrenOf[node] || []).filter(c => comp.includes(c)).sort();
        for (const k of kids) obj[k] = buildTree(k);
        return obj;
      }

      // Depth = node count on longest root-to-leaf path
      function depth(node) {
        const kids = (childrenOf[node] || []).filter(c => comp.includes(c));
        if (kids.length === 0) return 1;
        return 1 + Math.max(...kids.map(depth));
      }

      const entry = { root, tree: { [root]: buildTree(root) }, depth: depth(root) };
      hierarchies.push(entry);
    }
  }

  // 5. Summary
  const trees  = hierarchies.filter(h => !h.has_cycle);
  const cycles = hierarchies.filter(h => h.has_cycle);

  let largestTreeRoot = "";
  if (trees.length) {
    trees.sort((a, b) => b.depth !== a.depth ? b.depth - a.depth : a.root.localeCompare(b.root));
    largestTreeRoot = trees[0].root;
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root: largestTreeRoot,
    },
  };
}

module.exports = { processData };
