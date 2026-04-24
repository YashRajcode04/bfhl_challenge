/* ═══════════════════════════════════════════════════════════════
   BFHL Processor — Frontend Logic
   ═══════════════════════════════════════════════════════════════ */

const API_URL = window.location.origin + "/bfhl";

const EXAMPLE_DATA = [
  "A->B", "A->C", "B->D", "C->E", "E->F",
  "X->Y", "Y->Z", "Z->X",
  "P->Q", "Q->R",
  "G->H", "G->H", "G->I",
  "hello", "1->2", "A->"
];

// ── DOM refs ────────────────────────────────────────────────────
const $input     = document.getElementById("dataInput");
const $submit    = document.getElementById("submitBtn");
const $clear     = document.getElementById("clearBtn");
const $example   = document.getElementById("exampleBtn");
const $error     = document.getElementById("errorBanner");
const $results   = document.getElementById("results");

// ── Helpers ─────────────────────────────────────────────────────
function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }

function parseInput(raw) {
  const trimmed = raw.trim();
  // Try JSON array first
  if (trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed); } catch (_) { /* fall through */ }
  }
  // Comma-separated
  return trimmed.split(",").map(s => s.trim()).filter(Boolean);
}

// ── API call ────────────────────────────────────────────────────
async function submitData() {
  hide($error);
  hide($results);

  const data = parseInput($input.value);
  if (!data.length) {
    $error.textContent = "Please enter at least one node edge.";
    show($error);
    return;
  }

  $submit.classList.add("loading");
  $submit.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const json = await res.json();
    renderResults(json);
  } catch (err) {
    $error.textContent = `API Error — ${err.message}`;
    show($error);
  } finally {
    $submit.classList.remove("loading");
    $submit.disabled = false;
  }
}

// ── Render ──────────────────────────────────────────────────────
function renderResults(data) {
  // Identity
  document.getElementById("rUserId").textContent = data.user_id || "-";
  document.getElementById("rEmail").textContent  = data.email_id || "-";
  document.getElementById("rRoll").textContent   = data.college_roll_number || "-";

  // Summary
  const s = data.summary || {};
  document.getElementById("sTrees").textContent   = s.total_trees   ?? 0;
  document.getElementById("sCycles").textContent  = s.total_cycles  ?? 0;
  document.getElementById("sLargest").textContent = s.largest_tree_root || "-";

  // Hierarchies
  const $hier = document.getElementById("hierarchies");
  $hier.innerHTML = "";
  (data.hierarchies || []).forEach(h => $hier.appendChild(buildHierCard(h)));

  // Invalid
  const $inv = document.getElementById("invalidList");
  $inv.innerHTML = "";
  if (data.invalid_entries?.length) {
    data.invalid_entries.forEach(e => {
      const t = document.createElement("span");
      t.className = "tag tag-invalid";
      t.textContent = e || '""';
      $inv.appendChild(t);
    });
  } else {
    $inv.innerHTML = '<span class="empty-state">None</span>';
  }

  // Duplicates
  const $dup = document.getElementById("dupList");
  $dup.innerHTML = "";
  if (data.duplicate_edges?.length) {
    data.duplicate_edges.forEach(e => {
      const t = document.createElement("span");
      t.className = "tag tag-dup";
      t.textContent = e;
      $dup.appendChild(t);
    });
  } else {
    $dup.innerHTML = '<span class="empty-state">None</span>';
  }

  // Raw JSON
  document.getElementById("rawJson").textContent = JSON.stringify(data, null, 2);

  show($results);
  $results.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Hierarchy card builder ──────────────────────────────────────
function buildHierCard(h) {
  const isCycle = !!h.has_cycle;
  const card = document.createElement("div");
  card.className = `hier-card ${isCycle ? "cycle-card" : "tree-card"}`;

  const header = document.createElement("div");
  header.className = "hier-header";

  const rootEl = document.createElement("div");
  rootEl.className = "hier-root";
  rootEl.textContent = h.root;

  const meta = document.createElement("div");
  meta.className = "hier-meta";

  const badge = document.createElement("span");
  badge.className = `hier-badge ${isCycle ? "badge-cycle" : "badge-tree"}`;
  badge.textContent = isCycle ? "Cycle" : "Tree";

  let info = `Root: ${h.root}`;
  if (!isCycle && h.depth != null) info += `  ·  Depth: ${h.depth}`;
  meta.innerHTML = info + " ";
  meta.appendChild(badge);

  header.appendChild(rootEl);
  header.appendChild(meta);
  card.appendChild(header);

  // Tree visualisation
  if (!isCycle && h.tree && Object.keys(h.tree).length) {
    const viz = document.createElement("div");
    viz.className = "tree-viz";
    buildTreeDOM(h.tree, viz);
    card.appendChild(viz);
  } else if (isCycle) {
    const note = document.createElement("div");
    note.className = "hier-meta";
    note.style.paddingLeft = "0.5rem";
    note.textContent = "Cycle detected — tree structure unavailable";
    card.appendChild(note);
  }

  return card;
}

function buildTreeDOM(obj, parent) {
  for (const [key, children] of Object.entries(obj)) {
    const node = document.createElement("div");
    node.className = "tree-node";

    const label = document.createElement("span");
    label.className = "tree-label";
    label.textContent = key;
    node.appendChild(label);

    if (children && typeof children === "object" && Object.keys(children).length) {
      buildTreeDOM(children, node);
    }

    parent.appendChild(node);
  }
}

// ── Event listeners ─────────────────────────────────────────────
$submit.addEventListener("click", submitData);

$clear.addEventListener("click", () => {
  $input.value = "";
  hide($error);
  hide($results);
  $input.focus();
});

$example.addEventListener("click", () => {
  $input.value = EXAMPLE_DATA.join(", ");
  hide($error);
  $input.focus();
});

// Ctrl+Enter shortcut
$input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    submitData();
  }
});
