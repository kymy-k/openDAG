import { InputSchema, OutputSchema, type Input, type Output } from "./contract.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function run(input: Input): Output {
  const parsedInput = InputSchema.parse(input);
  const title = escapeHtml(parsedInput.title);
  const modelJson = safeJson(parsedInput.model);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #eef2f6;
      --panel: #ffffff;
      --ink: #101828;
      --muted: #667085;
      --line: #94a3b8;
      --line-soft: #d0d7e2;
      --focus: #2563eb;
      --planned: #64748b;
      --contracted: #7c3aed;
      --tested: #0f766e;
      --implemented: #c2410c;
      --verified: #15803d;
      --kind-pure: #15803d;
      --kind-imperative: #b42318;
      --kind-helper: #0f766e;
      --kind-orphan: #475467;
      --kind-template: #7c3aed;
      --kind-skill: #0369a1;
      --route-main: #155eef;
      --route-shell: #c2410c;
      --route-support: #64748b;
      --route-generated: #7c3aed;
      --route-skill: #0369a1;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
    }
    header {
      display: grid;
      grid-template-columns: minmax(220px, 1fr) auto;
      gap: 18px;
      align-items: center;
      min-height: 68px;
      padding: 12px 18px;
      border-bottom: 1px solid #d9e0ea;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    h1 { margin: 0; font-size: 18px; line-height: 1.25; letter-spacing: 0; }
    .subtitle { color: var(--muted); margin-top: 3px; font-size: 12px; }
    .summary { display: flex; flex-wrap: wrap; gap: 7px; justify-content: flex-end; }
    .chip {
      border: 1px solid #d0d5dd;
      border-radius: 999px;
      padding: 4px 8px;
      background: #fff;
      color: #344054;
      font-size: 12px;
      white-space: nowrap;
    }
    .route-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      align-items: center;
      margin-top: 7px;
    }
    .route-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #d0d5dd;
      border-radius: 999px;
      padding: 4px 8px;
      background: #fff;
      color: #344054;
      font-size: 12px;
    }
    .route-swatch {
      width: 18px;
      height: 3px;
      border-radius: 999px;
      background: var(--route-color);
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      height: calc(100vh - 68px);
      min-height: 520px;
    }
    .graph-panel {
      min-width: 0;
      overflow: auto;
      padding: 14px;
    }
    .graph-stage {
      display: inline-block;
      min-width: 100%;
      padding: 14px;
      border: 1px solid #d9e0ea;
      border-radius: 8px;
      background: #fff;
    }
    .details {
      border-left: 1px solid #d9e0ea;
      background: var(--panel);
      padding: 18px;
      overflow: auto;
    }
    .toolbar {
      display: flex;
      gap: 9px;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    input, select {
      height: 34px;
      border: 1px solid #cfd6e0;
      border-radius: 6px;
      padding: 0 10px;
      background: #fff;
      color: var(--ink);
      font: inherit;
      font-size: 13px;
    }
    input { width: 230px; max-width: 100%; }
    svg {
      display: block;
      overflow: visible;
      background:
        linear-gradient(#f7f9fc 1px, transparent 1px),
        linear-gradient(90deg, #f7f9fc 1px, transparent 1px);
      background-size: 28px 28px;
      border-radius: 6px;
    }
    .edge {
      stroke: var(--line-soft);
      stroke-width: 2;
      fill: none;
      marker-end: url(#arrow);
      transition: stroke 120ms ease, opacity 120ms ease, stroke-width 120ms ease;
    }
    .edge.route-main {
      stroke: var(--route-main);
      stroke-width: 3.25;
      opacity: 0.95;
    }
    .edge.route-shell {
      stroke: var(--route-shell);
      stroke-dasharray: 8 6;
    }
    .edge.route-support {
      stroke: var(--route-support);
      stroke-width: 1.5;
      opacity: 0.58;
    }
    .edge.route-generated {
      stroke: var(--route-generated);
      stroke-dasharray: 3 5;
      opacity: 0.7;
    }
    .edge.route-skill {
      stroke: var(--route-skill);
      stroke-dasharray: 10 5;
      opacity: 0.78;
    }
    .edge.highlight {
      stroke: var(--focus);
      stroke-width: 2.75;
      marker-end: url(#arrow-highlight);
    }
    .node {
      cursor: pointer;
      transition: opacity 120ms ease;
      outline: none;
    }
    .node-card {
      width: 100%;
      height: 100%;
      padding: 13px 14px;
      border: 2px solid var(--status-color);
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 8px 22px rgb(15 23 42 / 0.10);
      overflow: hidden;
    }
    .node-card.route-main {
      border-width: 3px;
      box-shadow: 0 12px 30px rgb(21 94 239 / 0.16), 0 8px 20px rgb(15 23 42 / 0.10);
    }
    .node-card.route-support,
    .node-card.route-generated {
      box-shadow: 0 5px 14px rgb(15 23 42 / 0.07);
    }
    .node-card.kind-imperative {
      border-style: dashed;
      background: #fff7ed;
    }
    .node-card.kind-orphan {
      border-style: dotted;
      background: #f8fafc;
    }
    .node-card.kind-template {
      background: #faf5ff;
    }
    .node-card.kind-skill {
      background: #f0f9ff;
    }
    .node-title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--ink);
      font-size: 15px;
      line-height: 20px;
      font-weight: 700;
      letter-spacing: 0;
    }
    .route-label {
      display: inline-flex;
      align-items: center;
      height: 18px;
      margin-bottom: 6px;
      padding: 0 6px;
      border-radius: 999px;
      background: rgb(16 24 40 / 0.06);
      color: #344054;
      font-size: 10px;
      line-height: 18px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .node-purpose {
      margin-top: 4px;
      height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #475467;
      font-size: 12px;
      line-height: 18px;
    }
    .node-footer {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
      margin-top: 9px;
      color: var(--muted);
      font-size: 12px;
      line-height: 16px;
      white-space: nowrap;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
    }
    .kind-pill {
      display: inline-flex;
      align-items: center;
      max-width: 92px;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #344054;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--status-color);
      flex: 0 0 auto;
    }
    .node.hidden, .edge.hidden { display: none; }
    .node.selected .node-card {
      border-color: var(--focus);
      box-shadow: 0 0 0 3px rgb(37 99 235 / 0.14), 0 10px 26px rgb(15 23 42 / 0.16);
    }
    .empty { color: var(--muted); }
    .details h2 { margin: 0; font-size: 20px; letter-spacing: 0; }
    .details p { line-height: 1.5; }
    .section { margin-top: 18px; }
    .section h3 {
      margin: 0 0 8px;
      font-size: 12px;
      line-height: 16px;
      color: #344054;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    ul { margin: 0; padding-left: 18px; }
    li { margin: 5px 0; }
    code {
      display: inline-block;
      max-width: 100%;
      padding: 2px 5px;
      border-radius: 4px;
      background: #f2f4f7;
      color: #344054;
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    .importance-meter {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 3px;
      width: 72px;
      margin-top: 6px;
    }
    .importance-meter span {
      height: 5px;
      border-radius: 999px;
      background: #d0d5dd;
    }
    .importance-meter span.active {
      background: var(--route-color);
    }
    @media (max-width: 980px) {
      header { grid-template-columns: 1fr; }
      .summary { justify-content: flex-start; }
      .layout { grid-template-columns: 1fr; height: auto; }
      .details { border-left: 0; border-top: 1px solid #d9e0ea; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${title}</h1>
      <div class="subtitle" id="subtitle"></div>
    </div>
    <div class="summary" id="summary"></div>
  </header>
  <main class="layout">
    <section class="graph-panel">
      <div class="toolbar">
        <input id="search" type="search" placeholder="Search nodes" aria-label="Search nodes">
        <select id="statusFilter" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="planned">planned</option>
          <option value="contracted">contracted</option>
          <option value="tested">tested</option>
          <option value="implemented">implemented</option>
          <option value="verified">verified</option>
        </select>
        <select id="routeFilter" aria-label="Filter by route">
          <option value="all">All routes</option>
          <option value="main">Main route</option>
          <option value="shell">Shell boundary</option>
          <option value="support">Support</option>
          <option value="generated">Generated</option>
          <option value="skill">Skill</option>
        </select>
        <select id="viewMode" aria-label="View mode">
          <option value="overview" selected>Overview</option>
          <option value="full">Full function graph</option>
        </select>
      </div>
      <div class="graph-stage">
        <svg id="graph" role="img" aria-label="DAG visualisation"></svg>
      </div>
    </section>
    <aside class="details" id="details">
      <p class="empty">Select a node to inspect its contract, dependencies, invariants, and allowed files.</p>
    </aside>
  </main>
  <script id="dag-data" type="application/json">${modelJson}</script>
  <script>
    const model = JSON.parse(document.getElementById("dag-data").textContent);
    const graph = document.getElementById("graph");
    const details = document.getElementById("details");
    const search = document.getElementById("search");
    const statusFilter = document.getElementById("statusFilter");
    const routeFilter = document.getElementById("routeFilter");
    const viewMode = document.getElementById("viewMode");
    const summary = document.getElementById("summary");
    const subtitle = document.getElementById("subtitle");
    const statusColor = {
      planned: "var(--planned)",
      contracted: "var(--contracted)",
      tested: "var(--tested)",
      implemented: "var(--implemented)",
      verified: "var(--verified)"
    };
    const kindColor = {
      pure: "var(--kind-pure)",
      imperative: "var(--kind-imperative)",
      helper: "var(--kind-helper)",
      orphan: "var(--kind-orphan)",
      template: "var(--kind-template)",
      skill: "var(--kind-skill)"
    };
    const routeColor = {
      main: "var(--route-main)",
      shell: "var(--route-shell)",
      support: "var(--route-support)",
      generated: "var(--route-generated)",
      skill: "var(--route-skill)"
    };
    const routeLabel = {
      main: "Main route",
      shell: "Shell boundary",
      support: "Support",
      generated: "Generated",
      skill: "Skill"
    };
    let selectedId = null;

    subtitle.textContent = model.nodes.length + " nodes, " + model.edges.length + " edges, arrows point from entry/caller to dependency";
    summary.innerHTML = Object.entries(model.statusCounts)
      .map(([status, count]) => '<span class="chip">' + status + ': ' + count + '</span>')
      .concat(
        Object.entries(model.kindCounts).map(
          ([kind, count]) => '<span class="chip">' + kind + ': ' + count + '</span>'
        )
      )
      .join("");
    summary.insertAdjacentHTML(
      "beforeend",
      '<div class="route-legend">' +
        Object.entries(routeLabel)
          .map(([route, label]) => '<span class="route-chip" style="--route-color: ' + routeColor[route] + '"><span class="route-swatch"></span>' + label + '</span>')
          .join("") +
      '</div>'
    );

    function escapeText(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function nodeById(id) {
      return model.nodes.find((node) => node.id === id);
    }

    function statusStyle(node) {
      return '--status-color: ' + statusColor[node.status] + '; --kind-color: ' + kindColor[node.kind] + '; --route-color: ' + routeColor[node.route];
    }

    function importanceMeter(node) {
      let html = '<div class="importance-meter" aria-label="Importance ' + node.importance + ' of 5">';
      for (let index = 1; index <= 5; index += 1) {
        html += '<span class="' + (index <= node.importance ? 'active' : '') + '"></span>';
      }
      return html + '</div>';
    }

    function dependencyIdsForNode(id, visited = new Set()) {
      const node = nodeById(id);
      if (!node) {
        return visited;
      }

      for (const dependency of node.dependencies) {
        if (visited.has(dependency)) {
          continue;
        }

        visited.add(dependency);
        dependencyIdsForNode(dependency, visited);
      }

      return visited;
    }

    function expandedDependencyIds() {
      if (!selectedId || viewMode.value !== "overview") {
        return new Set();
      }

      return dependencyIdsForNode(selectedId);
    }

    function isOverviewPromoted(node) {
      return node.importance >= 4 || node.id.startsWith("command.");
    }

    function expandedDependencyList() {
      const ids = expandedDependencyIds();
      if (selectedId) {
        ids.add(selectedId);
      }

      return Array.from(ids)
        .map((id) => nodeById(id))
        .filter((node) => node && !isOverviewPromoted(node))
        .sort((left, right) => {
          if (left.id === selectedId) {
            return -1;
          }

          if (right.id === selectedId) {
            return 1;
          }

          return left.id.localeCompare(right.id);
        });
    }

    function isVisible(node) {
      const query = search.value.trim().toLowerCase();
      const matchesQuery =
        query.length === 0 ||
        node.id.toLowerCase().includes(query) ||
        node.purpose.toLowerCase().includes(query);
      const matchesStatus = statusFilter.value === "all" || node.status === statusFilter.value;
      const matchesRoute = routeFilter.value === "all" || node.route === routeFilter.value;
      const isSelected = node.id === selectedId;
      const isExpandedDependency = expandedDependencyIds().has(node.id);
      const matchesMode =
        viewMode.value === "full" ||
        query.length > 0 ||
        isOverviewPromoted(node);
      return matchesStatus && matchesRoute && ((matchesQuery && matchesMode) || isSelected || isExpandedDependency);
    }

    function listSection(title, items) {
      if (items.length === 0) {
        return '<div class="section"><h3>' + title + '</h3><p class="empty">None</p></div>';
      }
      return '<div class="section"><h3>' + title + '</h3><ul>' +
        items.map((item) => '<li><code>' + escapeText(item) + '</code></li>').join("") +
        '</ul></div>';
    }

    function renderDetails(node) {
      details.innerHTML = [
        '<h2>' + escapeText(node.id) + '</h2>',
        '<div class="section"><h3>What It Does</h3><p>' + escapeText(node.purpose) + '</p></div>',
        '<div class="section"><h3>Route</h3><code>' + escapeText(routeLabel[node.route]) + '</code>' + importanceMeter(node) + '</div>',
        '<div class="section"><h3>Kind</h3><code>' + escapeText(node.kind) + '</code></div>',
        '<div class="section"><h3>Status</h3><code>' + escapeText(node.status) + '</code></div>',
        '<div class="section"><h3>Input It Expects</h3><p><code>' + escapeText(node.inputSchema) + '</code></p></div>',
        '<div class="section"><h3>Output It Gives</h3><p><code>' + escapeText(node.outputSchema) + '</code></p></div>',
        listSection("Dependencies", node.dependencies),
        listSection("Dependents", node.dependents),
        listSection("Invariants", node.invariants),
        listSection("Allowed files", node.allowedFiles)
      ].join("");
    }

    function selectNode(id) {
      selectedId = id;
      renderDetails(nodeById(id));
      updateState();
    }

    function connectedToSelected(edge) {
      return selectedId && (edge.from === selectedId || edge.to === selectedId);
    }

    function updateState() {
      const dimensions = graphDimensions();
      graph.setAttribute("viewBox", "0 0 " + dimensions.width + " " + dimensions.height);
      graph.setAttribute("width", String(dimensions.width));
      graph.setAttribute("height", String(dimensions.height));

      for (const group of graph.querySelectorAll(".node")) {
        const node = nodeById(group.dataset.id);
        const position = positionForNode(node);
        group.setAttribute(
          "transform",
          "translate(" + (position.x - node.width / 2) + " " + (position.y - node.height / 2) + ")"
        );
        const visible = isVisible(node);
        group.classList.toggle("hidden", !visible);
        group.classList.toggle("selected", node.id === selectedId);
      }
      for (const edge of graph.querySelectorAll(".edge")) {
        const from = nodeById(edge.dataset.from);
        const to = nodeById(edge.dataset.to);
        edge.setAttribute("d", edgePath(from, to));
        const visible = isVisible(from) && isVisible(to);
        edge.classList.toggle("hidden", !visible);
        edge.classList.toggle("highlight", connectedToSelected(edge.dataset));
      }
    }

    function expandedBandHeight() {
      const count = expandedDependencyList().length;
      if (count === 0) {
        return 0;
      }

      return 190 + (Math.ceil(count / 3) - 1) * 150;
    }

    function expandedDependencyPosition(node) {
      if (viewMode.value !== "overview" || isOverviewPromoted(node)) {
        return null;
      }

      const expanded = expandedDependencyList();
      const index = expanded.findIndex((candidate) => candidate.id === node.id);
      if (index === -1) {
        return null;
      }

      const columns = 3;
      const column = index % columns;
      const row = Math.floor(index / columns);
      return {
        x: 222 + column * 390,
        y: 116 + row * 150
      };
    }

    function positionForNode(node) {
      if (viewMode.value === "overview") {
        const expandedPosition = expandedDependencyPosition(node);
        if (expandedPosition) {
          return expandedPosition;
        }

        return { x: node.overviewX, y: node.overviewY + expandedBandHeight() };
      }
      return { x: node.x, y: node.y };
    }

    function edgePath(from, to) {
      const fromPosition = positionForNode(from);
      const toPosition = positionForNode(to);
      const startX = fromPosition.x;
      const startY = fromPosition.y + from.height / 2;
      const endX = toPosition.x;
      const endY = toPosition.y - to.height / 2;
      const handle = Math.max(56, (endY - startY) * 0.45);
      return "M " + startX + " " + startY +
        " C " + startX + " " + (startY + handle) +
        ", " + endX + " " + (endY - handle) +
        ", " + endX + " " + endY;
    }

    function renderNode(node) {
      const position = positionForNode(node);
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "node");
      group.setAttribute(
        "transform",
        "translate(" + (position.x - node.width / 2) + " " + (position.y - node.height / 2) + ")"
      );
      group.dataset.id = node.id;
      group.setAttribute("tabindex", "0");
      group.setAttribute("role", "button");
      group.setAttribute("aria-label", "Inspect " + node.id);
      group.innerHTML =
        '<foreignObject width="' + node.width + '" height="' + node.height + '">' +
          '<div xmlns="http://www.w3.org/1999/xhtml" class="node-card kind-' + escapeText(node.kind) + ' route-' + escapeText(node.route) + '" style="' + statusStyle(node) + '">' +
            '<div class="route-label">' + escapeText(routeLabel[node.route]) + '</div>' +
            '<div class="node-title" title="' + escapeText(node.id) + '">' + escapeText(node.id) + '</div>' +
            '<div class="node-purpose" title="' + escapeText(node.purpose) + '">' + escapeText(node.purpose) + '</div>' +
            '<div class="node-footer">' +
              '<span class="status-pill"><span class="status-dot"></span>' + escapeText(node.status) + '</span>' +
              '<span class="kind-pill" title="' + escapeText(node.kind) + '">' + escapeText(node.kind) + '</span>' +
              '<span>' + node.dependencies.length + '/' + node.dependents.length + '</span>' +
            '</div>' +
          '</div>' +
        '</foreignObject>';
      const card = group.querySelector(".node-card");
      card.addEventListener("click", (event) => {
        event.stopPropagation();
        selectNode(node.id);
      });
      group.addEventListener("click", () => selectNode(node.id));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node.id);
        }
      });
      return group;
    }

    function graphDimensions() {
      if (viewMode.value !== "overview") {
        return { width: model.width, height: model.height };
      }

      const bandHeight = expandedBandHeight();
      const expandedPositions = expandedDependencyList()
        .map((node) => expandedDependencyPosition(node))
        .filter(Boolean);
      if (expandedPositions.length === 0) {
        return { width: model.overviewWidth, height: model.overviewHeight };
      }

      const maxX = Math.max(...expandedPositions.map((position) => position.x));
      const maxY = Math.max(...expandedPositions.map((position) => position.y));
      return {
        width: Math.max(model.overviewWidth, maxX + 222),
        height: Math.max(model.overviewHeight + bandHeight, maxY + 160)
      };
    }

    function renderGraph() {
      const dimensions = graphDimensions();
      const width = dimensions.width;
      const height = dimensions.height;
      graph.setAttribute("viewBox", "0 0 " + width + " " + height);
      graph.setAttribute("width", String(width));
      graph.setAttribute("height", String(height));
      graph.innerHTML = '<defs>' +
        '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"></path></marker>' +
        '<marker id="arrow-highlight" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"></path></marker>' +
        '</defs>';

      for (const edge of model.edges) {
        const from = nodeById(edge.from);
        const to = nodeById(edge.to);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", edgePath(from, to));
        path.setAttribute("class", "edge route-" + edge.route);
        path.dataset.from = edge.from;
        path.dataset.to = edge.to;
        graph.appendChild(path);
      }

      for (const node of model.nodes) {
        graph.appendChild(renderNode(node));
      }

      updateState();
    }

    search.addEventListener("input", updateState);
    statusFilter.addEventListener("change", updateState);
    routeFilter.addEventListener("change", updateState);
    viewMode.addEventListener("change", updateState);
    renderGraph();
  </script>
</body>
</html>`;

  return OutputSchema.parse({ html });
}
