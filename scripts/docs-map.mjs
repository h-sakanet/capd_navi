#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const docsRoot = path.join(repoRoot, "docs");
const specsRoot = path.join(repoRoot, "test", "specs");
const generatedRoot = path.join(docsRoot, "generated");
const generatedHtmlRoot = path.join(generatedRoot, "html");

const checkMode = process.argv.includes("--check");

const ID_REGEX = /\b(?:E2E|JRN|SCR|ACT|FC|FR|AT|UT|VR|NFR|UI)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;
const RANGE_REGEX = /\b((?:[A-Z0-9]+-)+)(\d{3})\s*[〜~]\s*((?:[A-Z0-9]+-)+)?(\d{3})\b/g;

const TYPE_ORDER = {
  JRN: 10,
  ACT: 20,
  SCR: 30,
  FC: 40,
  UI: 50,
  FR: 60,
  NFR: 70,
  AT: 80,
  E2E: 90,
  UT: 90,
  VR: 90,
  DATA: 95
};

const TYPE_LABEL = {
  JRN: "Journeys",
  ACT: "Actions",
  SCR: "Screens",
  FC: "Forms",
  UI: "UI Elements",
  FR: "Functional Requirements",
  NFR: "Non-Functional Requirements",
  AT: "Acceptance Tests",
  E2E: "E2E Tests",
  UT: "Unit Tests",
  VR: "Visual Tests",
  DATA: "Data Paths"
};

const LEGACY_JRN_ID_MAP = new Map([
  ["JRN-CSV-001", "JRN-001-CSV"],
  ["JRN-SLOT-001", "JRN-002-SLOT"],
  ["JRN-SESSION-001", "JRN-003-SESSION"],
  ["JRN-ABORT-001", "JRN-004-ABORT"],
  ["JRN-SYNC-001", "JRN-005-SYNC"],
  ["JRN-RECOVERY-001", "JRN-006-RECOVERY"],
  ["JRN-ALARM-001", "JRN-007-ALARM"],
  ["JRN-HISTORY-001", "JRN-008-HISTORY"],
  ["JRN-EXITPHOTO-001", "JRN-009-EXITPHOTO"]
]);

const LEGACY_SCR_ID_MAP = new Map([
  ["SCR-HOME-001", "SCR-001-HOME"],
  ["SCR-HOME-SETUP-001", "SCR-002-HOME-SETUP"],
  ["SCR-HOME-START-CONFIRM-001", "SCR-003-HOME-START-CONFIRM"],
  ["SCR-HOME-VIEW-CONFIRM-001", "SCR-004-HOME-VIEW-CONFIRM"],
  ["SCR-HOME-SUMMARY-001", "SCR-005-HOME-SUMMARY"],
  ["SCR-SESSION-001", "SCR-006-SESSION"],
  ["SCR-SESSION-RECORD-001", "SCR-007-SESSION-RECORD"],
  ["SCR-HISTORY-001", "SCR-008-HISTORY"],
  ["SCR-HISTORY-DETAIL-001", "SCR-009-HISTORY-DETAIL"],
  ["SCR-HISTORY-PHOTO-001", "SCR-010-HISTORY-PHOTO"],
  ["SCR-SYNC-STATUS-001", "SCR-011-SYNC-STATUS"],
  ["SCR-MAC-IMPORT-001", "SCR-012-MAC-IMPORT"]
]);

function normalizeNewline(value) {
  return value.replace(/\r\n/g, "\n");
}

function normalizeJourneyId(id) {
  if (LEGACY_JRN_ID_MAP.has(id)) {
    return LEGACY_JRN_ID_MAP.get(id);
  }
  return id;
}

function normalizeScreenId(id) {
  if (LEGACY_SCR_ID_MAP.has(id)) {
    return LEGACY_SCR_ID_MAP.get(id);
  }
  return id;
}

function normalizeId(id) {
  const journeyNormalized = normalizeJourneyId(id);
  if (journeyNormalized !== id) {
    return journeyNormalized;
  }

  const screenNormalized = normalizeScreenId(id);
  if (screenNormalized !== id) {
    return screenNormalized;
  }

  const actMiddle = id.match(/^ACT-(\d{3})-([A-Z0-9-]+)$/);
  if (actMiddle) {
    return `ACT-${actMiddle[2]}-${actMiddle[1]}`;
  }
  return id;
}

function getType(id) {
  if (/^(?:SCR|CAP)-[A-Z0-9-]+-FR-\d{2,3}$/.test(id)) {
    return "FR";
  }
  if (id.startsWith("DATA:")) {
    return "DATA";
  }
  return id.split("-")[0];
}

function getTypeRank(id) {
  const type = getType(id);
  return TYPE_ORDER[type] ?? 999;
}

function splitTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }
  const cells = trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
  if (!cells.length) {
    return null;
  }
  return cells;
}

function isSeparatorRow(line) {
  const cells = splitTableRow(line);
  if (!cells) {
    return false;
  }
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isValidId(id) {
  const type = getType(id);
  switch (type) {
    case "JRN":
      return /^(?:JRN-\d{3}-[A-Z0-9]+(?:-[A-Z0-9]+)*|JRN-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3})$/.test(id);
    case "SCR":
      return /^(?:SCR-\d{3}-[A-Z0-9-]+|SCR-[A-Z0-9-]+-\d{3})$/.test(id);
    case "ACT":
      return /^(?:ACT-[A-Z0-9-]+-\d{3}|ACT-\d{3}-[A-Z0-9-]+)$/.test(id);
    case "FC":
      return /^FC-[A-Z0-9-]+-\d{3}$/.test(id);
    case "FR":
      return /^FR-\d{3}[A-Z]?$/.test(id) || /^(?:SCR|CAP)-[A-Z0-9-]+-FR-\d{2,3}$/.test(id);
    case "NFR":
      return /^NFR-\d{3}$/.test(id);
    case "AT":
      return /^AT-[A-Z0-9-]+-\d{3}$/.test(id);
    case "E2E":
      return /^E2E-[A-Z0-9-]+-\d{3}$/.test(id);
    case "UT":
      return /^UT-[A-Z0-9-]+-\d{3}$/.test(id);
    case "VR":
      return /^VR-[A-Z0-9-]+-\d{3}$/.test(id);
    case "UI":
      return /^UI-[A-Z0-9-]+$/.test(id);
    default:
      return false;
  }
}

function stripMarkdown(value) {
  return value
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function collectIds(text) {
  const ids = new Set();

  const direct = text.matchAll(ID_REGEX);
  for (const match of direct) {
    const normalized = normalizeId(match[0]);
    if (isValidId(normalized)) {
      ids.add(normalized);
    }
  }

  const ranges = text.matchAll(RANGE_REGEX);
  for (const match of ranges) {
    const prefix = match[1];
    const start = Number(match[2]);
    const endPrefix = match[3] ?? prefix;
    const end = Number(match[4]);
    if (prefix !== endPrefix || Number.isNaN(start) || Number.isNaN(end) || end < start) {
      continue;
    }
    for (let current = start; current <= end; current += 1) {
      const candidate = normalizeId(`${prefix}${String(current).padStart(3, "0")}`);
      if (isValidId(candidate)) {
        ids.add(candidate);
      }
    }
  }

  return [...ids];
}

function collectBacktickValues(text) {
  const values = [];
  const regex = /`([^`]+)`/g;
  for (const match of text.matchAll(regex)) {
    const parts = match[1]
      .split(/\s*\+\s*|\s*,\s*/)
      .map((token) => token.trim())
      .filter(Boolean);
    values.push(...parts);
  }
  return values;
}

function createGraph() {
  return {
    nodes: new Map(),
    edges: new Map(),
    outgoing: new Map(),
    incoming: new Map(),
    definitions: new Map(),
    references: new Map(),
    e2eStateByAt: new Map()
  };
}

function addReference(graph, id, source) {
  if (!graph.references.has(id)) {
    graph.references.set(id, new Set());
  }
  graph.references.get(id).add(source);
}

function addDefinition(graph, id, source) {
  if (!graph.definitions.has(id)) {
    graph.definitions.set(id, new Set());
  }
  graph.definitions.get(id).add(source);
}

function addNode(graph, id, options = {}) {
  if (!graph.nodes.has(id)) {
    graph.nodes.set(id, {
      id,
      type: options.type ?? getType(id),
      label: options.label ?? id,
      files: new Set(),
      metadata: {}
    });
  }
  const node = graph.nodes.get(id);
  if (options.label && (node.label === node.id || node.label.length > options.label.length)) {
    node.label = options.label;
  }
  if (options.file) {
    node.files.add(options.file);
  }
  return node;
}

function addAdjacency(map, from, to) {
  if (!map.has(from)) {
    map.set(from, new Set());
  }
  map.get(from).add(to);
}

function normalizeEdgeDirection(sourceId, targetId) {
  const sourceRank = getTypeRank(sourceId);
  const targetRank = getTypeRank(targetId);
  if (sourceRank === targetRank) {
    return null;
  }
  if (sourceRank < targetRank) {
    return [sourceId, targetId];
  }
  return [targetId, sourceId];
}

function addEdge(graph, sourceId, targetId, reason, evidence) {
  if (sourceId === targetId) {
    return;
  }
  addNode(graph, sourceId);
  addNode(graph, targetId);

  const normalized = normalizeEdgeDirection(sourceId, targetId);
  if (!normalized) {
    return;
  }

  const [from, to] = normalized;
  const key = `${from}->${to}`;
  if (!graph.edges.has(key)) {
    graph.edges.set(key, {
      from,
      to,
      reasons: new Set(),
      evidences: new Set()
    });
    addAdjacency(graph.outgoing, from, to);
    addAdjacency(graph.incoming, to, from);
  }
  const edge = graph.edges.get(key);
  edge.reasons.add(reason);
  edge.evidences.add(evidence);
}

async function walkMarkdownFiles(rootDir) {
  const files = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (fullPath.includes(path.join("docs", "generated"))) {
        continue;
      }
      const nested = await walkMarkdownFiles(fullPath);
      files.push(...nested);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseLineDefinitions(graph, relativeFile, lineNumber, line) {
  const source = `${relativeFile}:${lineNumber}`;
  const headingMatch = line.match(/^#{1,6}\s+`?((?:E2E|JRN|SCR|ACT|FC|FR|AT|UT|VR|NFR|UI)-[A-Z0-9]+(?:-[A-Z0-9]+)*)`?/);
  if (headingMatch) {
    const id = normalizeId(headingMatch[1]);
    if (isValidId(id)) {
      addDefinition(graph, id, source);
      addNode(graph, id, { file: relativeFile });
    }
  }

  const bulletMatch = line.match(/^\s*[-*]\s+`?((?:E2E|JRN|SCR|ACT|FC|FR|AT|UT|VR|NFR|UI)-[A-Z0-9]+(?:-[A-Z0-9]+)*)`?\s*:/);
  if (bulletMatch) {
    const id = normalizeId(bulletMatch[1]);
    if (isValidId(id)) {
      addDefinition(graph, id, source);
      const label = stripMarkdown(line.split(":").slice(0, 2).join(":"));
      addNode(graph, id, { label, file: relativeFile });
    }
  }
}

function parseMarkdownTables(graph, relativeFile, lines) {
  for (let index = 0; index < lines.length - 2; index += 1) {
    const headerCells = splitTableRow(lines[index]);
    if (!headerCells || !isSeparatorRow(lines[index + 1])) {
      continue;
    }

    const headerHasId = headerCells.some((cell) =>
      /(?:^|[^\w])(ID|要件ID|受入ID|テストID|JRN ID|SCR ID|ACT ID|FC ID|E2E ID|VR ID)(?:$|[^\w])/i.test(cell)
    );
    if (!headerHasId) {
      continue;
    }

    let rowIndex = index + 2;
    while (rowIndex < lines.length) {
      if (isSeparatorRow(lines[rowIndex])) {
        rowIndex += 1;
        continue;
      }

      const rowCells = splitTableRow(lines[rowIndex]);
      if (!rowCells) {
        break;
      }
      const firstCellIds = collectIds(rowCells[0] ?? "");
      if (firstCellIds.length) {
        for (const id of firstCellIds) {
          addDefinition(graph, id, `${relativeFile}:${rowIndex + 1}`);
          addNode(graph, id, { file: relativeFile });
        }
      }

      if (firstCellIds.length === 1) {
        const secondCell = rowCells[1] ?? "";
        const secondCellHasId = collectIds(secondCell).length > 0;
        const labelText = stripMarkdown(secondCell);
        if (labelText && !secondCellHasId && labelText !== "-" && labelText.length <= 80) {
          addNode(graph, firstCellIds[0], {
            label: `${firstCellIds[0]} ${labelText}`,
            file: relativeFile
          });
        }
      }

      if (relativeFile.endsWith("traceability-matrix.md") && rowCells.length >= 5) {
        const frIds = collectIds(rowCells[0] ?? "").filter((id) => getType(id) === "FR");
        const atIds = collectIds(rowCells[1] ?? "").filter((id) => getType(id) === "AT");
        const testIds = collectIds(rowCells[2] ?? "").filter((id) => ["UT", "E2E", "VR"].includes(getType(id)));
        const stateValue = stripMarkdown(rowCells[4] ?? "");

        for (const frId of frIds) {
          for (const atId of atIds) {
            addEdge(graph, frId, atId, "traceability-fr-at", `${relativeFile}:${rowIndex + 1}`);
          }
          for (const testId of testIds) {
            addEdge(graph, frId, testId, "traceability-fr-test", `${relativeFile}:${rowIndex + 1}`);
          }
        }

        for (const atId of atIds) {
          for (const testId of testIds) {
            addEdge(graph, atId, testId, "traceability-at-test", `${relativeFile}:${rowIndex + 1}`);
          }
        }

        if (stateValue) {
          for (const atId of atIds) {
            if (!graph.e2eStateByAt.has(atId)) {
              graph.e2eStateByAt.set(atId, new Set());
            }
            if (testIds.some((id) => getType(id) === "E2E")) {
              graph.e2eStateByAt.get(atId).add(stateValue);
            }
          }
        }
      }

      rowIndex += 1;
    }
    index = rowIndex;
  }
}

function parseUiDataPaths(graph, relativeFile, lines) {
  if (!relativeFile.endsWith(path.join("requirements", "12_ui_data_binding_matrix.md"))) {
    return;
  }

  let inUiTable = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes("| UI ID |")) {
      inUiTable = true;
      continue;
    }
    if (!inUiTable) {
      continue;
    }
    const cells = splitTableRow(line);
    if (!cells) {
      inUiTable = false;
      continue;
    }
    if (!cells.length || cells[0] === "UI ID" || /^:?-{3,}:?$/.test(cells[0])) {
      continue;
    }

    const uiIds = collectIds(cells[0]).filter((id) => getType(id) === "UI");
    if (!uiIds.length) {
      continue;
    }
    const uiId = uiIds[0];
    const source = `${relativeFile}:${index + 1}`;

    const dataColumns = [
      { role: "read", value: cells[3] ?? "" },
      { role: "write", value: cells[4] ?? "" },
      { role: "outbox", value: cells[5] ?? "" }
    ];

    for (const column of dataColumns) {
      const candidates = collectBacktickValues(column.value).filter((token) => {
        if (!token || token === "-") {
          return false;
        }
        if (collectIds(token).length > 0) {
          return false;
        }
        return true;
      });

      for (const candidate of candidates) {
        const dataId = `DATA:${candidate}`;
        addNode(graph, dataId, { type: "DATA", label: candidate, file: relativeFile });
        addEdge(graph, uiId, dataId, `ui-${column.role}`, source);
      }
    }
  }
}

function parseRelationships(graph, relativeFile, lines) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const ids = collectIds(line);
    if (!ids.length) {
      continue;
    }
    const source = `${relativeFile}:${index + 1}`;
    for (const id of ids) {
      addNode(graph, id, { file: relativeFile });
      addReference(graph, id, source);
    }

    if (ids.length < 2) {
      continue;
    }

    const anchor = ids[0];
    for (const target of ids.slice(1)) {
      addEdge(graph, anchor, target, "line-cooccurrence", source);
    }
  }
}

function getSortedNodes(graph, filterFn = () => true) {
  return [...graph.nodes.values()]
    .filter(filterFn)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function getSortedEdges(graph, nodeSet = null) {
  return [...graph.edges.values()]
    .filter((edge) => {
      if (!nodeSet) {
        return true;
      }
      return nodeSet.has(edge.from) && nodeSet.has(edge.to);
    })
    .sort((left, right) => {
      const fromCompare = left.from.localeCompare(right.from);
      if (fromCompare !== 0) {
        return fromCompare;
      }
      return left.to.localeCompare(right.to);
    });
}

function escapeMermaidLabel(value) {
  return value.replace(/"/g, "'");
}

function renderMermaid(graph, nodeIds, edges, title) {
  const nodes = nodeIds
    .map((id) => graph.nodes.get(id))
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
  const alias = new Map();
  nodes.forEach((node, index) => {
    alias.set(node.id, `N${index + 1}`);
  });

  const lines = [];
  lines.push("```mermaid");
  lines.push("flowchart LR");
  if (title) {
    lines.push(`  %% ${title}`);
  }

  const kinds = [...new Set(nodes.map((node) => node.type))].sort((a, b) => {
    const orderA = TYPE_ORDER[a] ?? 999;
    const orderB = TYPE_ORDER[b] ?? 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });

  for (const kind of kinds) {
    const kindNodes = nodes.filter((node) => node.type === kind);
    lines.push(`  subgraph ${kind}["${TYPE_LABEL[kind] ?? kind}"]`);
    for (const node of kindNodes) {
      lines.push(`    ${alias.get(node.id)}["${escapeMermaidLabel(node.label)}"]`);
    }
    lines.push("  end");
  }

  for (const edge of edges) {
    if (!alias.has(edge.from) || !alias.has(edge.to)) {
      continue;
    }
    lines.push(`  ${alias.get(edge.from)} --> ${alias.get(edge.to)}`);
  }

  lines.push("```");
  return lines.join("\n");
}

function getReachable(graph, seedId, maxDepth) {
  const visited = new Set([seedId]);
  let frontier = new Set([seedId]);
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const next = new Set();
    for (const current of frontier) {
      const outgoing = graph.outgoing.get(current) ?? new Set();
      for (const candidate of outgoing) {
        if (!visited.has(candidate)) {
          visited.add(candidate);
          next.add(candidate);
        }
      }
    }
    frontier = next;
    if (!frontier.size) {
      break;
    }
  }
  return visited;
}

function getNeighborhood(graph, seedId, maxDepth) {
  const visited = new Set([seedId]);
  let frontier = new Set([seedId]);
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const next = new Set();
    for (const current of frontier) {
      const outgoing = graph.outgoing.get(current) ?? new Set();
      const incoming = graph.incoming.get(current) ?? new Set();
      for (const candidate of [...outgoing, ...incoming]) {
        if (!visited.has(candidate)) {
          visited.add(candidate);
          next.add(candidate);
        }
      }
    }
    frontier = next;
    if (!frontier.size) {
      break;
    }
  }
  return visited;
}

function summarizeCounts(graph) {
  const counts = {};
  for (const node of graph.nodes.values()) {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
  }
  return counts;
}

function buildPhase1AtIds() {
  const ids = [];
  for (let current = 1; current <= 6; current += 1) {
    ids.push(`AT-SYNC-${String(current).padStart(3, "0")}`);
  }
  for (let current = 1; current <= 3; current += 1) {
    ids.push(`AT-RECOVERY-${String(current).padStart(3, "0")}`);
  }
  for (let current = 1; current <= 4; current += 1) {
    ids.push(`AT-ALARM-${String(current).padStart(3, "0")}`);
  }
  for (let current = 1; current <= 4; current += 1) {
    ids.push(`AT-CSV-${String(current).padStart(3, "0")}`);
  }
  ids.push("AT-API-001", "AT-API-003", "AT-API-004");
  return ids;
}

function hasEdgeToType(graph, nodeId, type) {
  const outgoing = graph.outgoing.get(nodeId) ?? new Set();
  for (const candidate of outgoing) {
    if (getType(candidate) === type) {
      return true;
    }
  }
  return false;
}

function hasEdgeFromType(graph, nodeId, type) {
  const incoming = graph.incoming.get(nodeId) ?? new Set();
  for (const candidate of incoming) {
    if (getType(candidate) === type) {
      return true;
    }
  }
  return false;
}

function collectConsistencyIssues(graph) {
  const issues = [];

  const unresolved = [...graph.references.keys()].filter((id) => !graph.definitions.has(id)).sort();
  for (const id of unresolved) {
    const refs = [...graph.references.get(id)].slice(0, 3).join(", ");
    issues.push({
      severity: "P1",
      code: "UNRESOLVED_ID",
      message: `${id} が参照されていますが定義が見つかりません。例: ${refs}`
    });
  }

  const allNodes = getSortedNodes(graph);
  for (const node of allNodes) {
    const outgoingCount = (graph.outgoing.get(node.id) ?? new Set()).size;
    const incomingCount = (graph.incoming.get(node.id) ?? new Set()).size;

    if (node.type === "JRN") {
      if (!hasEdgeToType(graph, node.id, "ACT")) {
        issues.push({
          severity: "P0",
          code: "JRN_WITHOUT_ACT",
          message: `${node.id} に ACT 接続がありません。`
        });
      }
      if (!hasEdgeToType(graph, node.id, "SCR")) {
        issues.push({
          severity: "P0",
          code: "JRN_WITHOUT_SCR",
          message: `${node.id} に SCR 接続がありません。`
        });
      }
    }

    if (node.type === "SCR") {
      const hasActRelation = hasEdgeFromType(graph, node.id, "ACT") || hasEdgeToType(graph, node.id, "ACT");
      if (!hasActRelation) {
        issues.push({
          severity: "P0",
          code: "SCR_WITHOUT_ACT",
          message: `${node.id} に ACT 接続がありません。`
        });
      }
      const hasJourneyRelation = hasEdgeFromType(graph, node.id, "JRN") || hasEdgeToType(graph, node.id, "JRN");
      if (!hasJourneyRelation) {
        issues.push({
          severity: "P1",
          code: "SCR_WITHOUT_JRN",
          message: `${node.id} に JRN 接続がありません。`
        });
      }
    }

    if (node.type === "ACT") {
      if (!hasEdgeToType(graph, node.id, "SCR")) {
        issues.push({
          severity: "P0",
          code: "ACT_WITHOUT_SCR",
          message: `${node.id} に SCR 接続がありません。`
        });
      }
      if (!hasEdgeFromType(graph, node.id, "JRN")) {
        issues.push({
          severity: "P1",
          code: "ACT_WITHOUT_JRN",
          message: `${node.id} に JRN 接続がありません。`
        });
      }
    }

    if (node.type === "FC") {
      const hasScreenRelation = hasEdgeToType(graph, node.id, "SCR") || hasEdgeFromType(graph, node.id, "SCR");
      if (!hasScreenRelation) {
        issues.push({
          severity: "P0",
          code: "FC_WITHOUT_SCR",
          message: `${node.id} に SCR 接続がありません。`
        });
      }
    }

    if (node.type === "AT") {
      const hasExecutableTest =
        hasEdgeToType(graph, node.id, "E2E") || hasEdgeToType(graph, node.id, "VR");
      if (!hasExecutableTest) {
        issues.push({
          severity: "P0",
          code: "AT_WITHOUT_E2E",
          message: `${node.id} に E2E/VR 接続がありません。`
        });
      }
    }

    if (outgoingCount + incomingCount === 0 && ["JRN", "SCR", "ACT", "FC", "AT", "E2E"].includes(node.type)) {
      issues.push({
        severity: "P1",
        code: "ORPHAN_NODE",
        message: `${node.id} が孤立しています。`
      });
    }
  }

  const phase1AtIds = buildPhase1AtIds();
  for (const atId of phase1AtIds) {
    if (!graph.nodes.has(atId)) {
      issues.push({
        severity: "P0",
        code: "PHASE1_AT_MISSING",
        message: `Phase1必須の ${atId} がドキュメント上に存在しません。`
      });
      continue;
    }
    if (!hasEdgeToType(graph, atId, "E2E")) {
      issues.push({
        severity: "P0",
        code: "PHASE1_AT_WITHOUT_E2E",
        message: `Phase1必須の ${atId} に E2E 接続がありません。`
      });
    }

    const states = graph.e2eStateByAt.get(atId);
    if (states && [...states].some((state) => state === "Deferred")) {
      issues.push({
        severity: "P0",
        code: "PHASE1_AT_DEFERRED",
        message: `Phase1必須の ${atId} が Deferred になっています。`
      });
    }
  }

  return issues.sort((left, right) => {
    const severityOrder = { P0: 0, P1: 1, P2: 2 };
    if (severityOrder[left.severity] !== severityOrder[right.severity]) {
      return severityOrder[left.severity] - severityOrder[right.severity];
    }
    return left.message.localeCompare(right.message);
  });
}

function buildConsistencyReport(graph, issues) {
  const counts = summarizeCounts(graph);
  const lines = [];
  lines.push("# ドキュメント整合性レポート");
  lines.push("");
  lines.push(`- 生成日時: ${new Date().toISOString()}`);
  lines.push(`- ノード数: ${graph.nodes.size}`);
  lines.push(`- エッジ数: ${graph.edges.size}`);
  lines.push("");
  lines.push("## ノード件数");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|---|---:|");
  for (const type of Object.keys(TYPE_LABEL).sort((a, b) => (TYPE_ORDER[a] ?? 999) - (TYPE_ORDER[b] ?? 999))) {
    const count = counts[type] ?? 0;
    if (count > 0) {
      lines.push(`| ${type} | ${count} |`);
    }
  }

  lines.push("");
  lines.push("## 指摘");
  lines.push("");
  if (!issues.length) {
    lines.push("- 指摘はありません。");
  } else {
    lines.push("| Severity | Code | Message |");
    lines.push("|---|---|---|");
    for (const issue of issues) {
      lines.push(`| ${issue.severity} | ${issue.code} | ${issue.message} |`);
    }
  }

  return lines.join("\n");
}

function buildOverviewMarkdown(graph) {
  const allowedTypes = new Set(["JRN", "ACT", "SCR", "FC", "UI", "DATA", "AT", "E2E"]);
  const nodeIds = new Set(
    getSortedNodes(graph, (node) => allowedTypes.has(node.type)).map((node) => node.id)
  );
  const edges = getSortedEdges(graph, nodeIds).filter(
    (edge) => allowedTypes.has(getType(edge.from)) && allowedTypes.has(getType(edge.to))
  );

  const lines = [];
  lines.push("# 全体マップ");
  lines.push("");
  lines.push(renderMermaid(graph, [...nodeIds], edges, "Journey -> Action -> Screen -> Form -> AT -> E2E"));
  lines.push("");
  return lines.join("\n");
}

function buildTraceabilityMarkdown(graph) {
  const allowedTypes = new Set(["FR", "AT", "E2E", "UT", "VR"]);
  const nodeIds = new Set(
    getSortedNodes(graph, (node) => allowedTypes.has(node.type)).map((node) => node.id)
  );
  const edges = getSortedEdges(graph, nodeIds).filter(
    (edge) => allowedTypes.has(getType(edge.from)) && allowedTypes.has(getType(edge.to))
  );

  const lines = [];
  lines.push("# 要件トレーサビリティマップ");
  lines.push("");
  lines.push(renderMermaid(graph, [...nodeIds], edges, "FR -> AT -> Test"));
  lines.push("");
  return lines.join("\n");
}

function buildJourneyMarkdown(graph, journeyId) {
  const reachable = getReachable(graph, journeyId, 6);
  if (!reachable.has(journeyId)) {
    reachable.add(journeyId);
  }
  const filtered = new Set(
    [...reachable].filter((id) =>
      ["JRN", "ACT", "SCR", "FC", "UI", "DATA", "FR", "AT", "E2E"].includes(getType(id))
    )
  );
  const edges = getSortedEdges(graph, filtered);
  const lines = [];
  lines.push(`# ${journeyId} マップ`);
  lines.push("");
  lines.push(renderMermaid(graph, [...filtered], edges, journeyId));
  lines.push("");
  return lines.join("\n");
}

function buildScreenMarkdown(graph, screenId) {
  const neighborhood = getNeighborhood(graph, screenId, 2);
  const filtered = new Set(
    [...neighborhood].filter((id) =>
      ["SCR", "JRN", "ACT", "FC", "UI", "DATA", "AT", "E2E"].includes(getType(id))
    )
  );
  filtered.add(screenId);
  const edges = getSortedEdges(graph, filtered);
  const lines = [];
  lines.push(`# ${screenId} マップ`);
  lines.push("");
  lines.push(renderMermaid(graph, [...filtered], edges, screenId));
  lines.push("");
  return lines.join("\n");
}

function buildIndexMarkdown(graph, issues) {
  const journeys = getSortedNodes(graph, (node) => node.type === "JRN").map((node) => node.id);
  const screens = getSortedNodes(graph, (node) => node.type === "SCR").map((node) => node.id);

  const lines = [];
  lines.push("# ドキュメント可視化インデックス");
  lines.push("");
  lines.push("- 生成元: `scripts/docs-map.mjs`");
  lines.push(`- 生成日時: ${new Date().toISOString()}`);
  lines.push(`- 整合性指摘件数: ${issues.length}`);
  lines.push("");
  lines.push("## 全体図");
  lines.push("");
  lines.push("- [全体マップ](./overview.md)");
  lines.push("- [要件トレーサビリティ](./traceability.md)");
  lines.push("- [整合性レポート](./consistency-report.md)");
  lines.push("- [Graph JSON](./graph.json)");
  lines.push("");
  lines.push("## ジャーニー別");
  lines.push("");
  for (const journeyId of journeys) {
    lines.push(`- [${journeyId}](./journeys/${journeyId}.md)`);
  }
  lines.push("");
  lines.push("## 画面別");
  lines.push("");
  for (const screenId of screens) {
    lines.push(`- [${screenId}](./screens/${screenId}.md)`);
  }
  lines.push("");
  return lines.join("\n");
}

function buildGraphJson(graph) {
  const nodes = getSortedNodes(graph).map((node) => ({
    id: node.id,
    type: node.type,
    label: node.label
  }));
  const edges = getSortedEdges(graph).map((edge) => ({
    from: edge.from,
    to: edge.to,
    reasons: [...edge.reasons].sort()
  }));
  return JSON.stringify({ nodes, edges }, null, 2);
}

function toWebPath(value) {
  return value.replaceAll(path.sep, "/");
}

function getRelativeHref(fromPath, targetPath, fragment = null) {
  let relative = toWebPath(path.relative(path.dirname(fromPath), targetPath));
  if (!relative || relative === "") {
    relative = ".";
  } else if (!relative.startsWith(".") && !relative.startsWith("/")) {
    relative = `./${relative}`;
  }
  if (!fragment) {
    return relative;
  }
  return `${relative}#${fragment}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseSourceLocation(source) {
  const splitAt = source.lastIndexOf(":");
  if (splitAt <= 0) {
    return null;
  }
  const file = source.slice(0, splitAt);
  const line = Number(source.slice(splitAt + 1));
  if (!Number.isInteger(line) || line < 1) {
    return null;
  }
  return { file, line };
}

function compareSourceLocation(left, right) {
  const fileCompare = left.file.localeCompare(right.file);
  if (fileCompare !== 0) {
    return fileCompare;
  }
  return left.line - right.line;
}

function isSameLocation(left, right) {
  return left.file === right.file && left.line === right.line;
}

function getSourceHtmlPath(relativeFile) {
  return path.join(generatedHtmlRoot, "sources", relativeFile.replace(/\.md$/i, ".html"));
}

function getNodeHtmlPath(id) {
  const type = getType(id);
  if (type === "JRN") {
    return path.join(generatedHtmlRoot, "journeys", `${id}.html`);
  }
  if (type === "SCR") {
    return path.join(generatedHtmlRoot, "screens", `${id}.html`);
  }
  if (type === "DATA") {
    return null;
  }
  return path.join(generatedHtmlRoot, "ids", `${id}.html`);
}

function truncateText(value, maxLength = 180) {
  if (!value || value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 3)}...`;
}

function normalizeLegacyIdsInText(value) {
  if (!value) {
    return value;
  }
  let normalized = value;
  for (const [legacyId, newId] of LEGACY_JRN_ID_MAP.entries()) {
    normalized = normalized.replaceAll(legacyId, newId);
  }
  for (const [legacyId, newId] of LEGACY_SCR_ID_MAP.entries()) {
    normalized = normalized.replaceAll(legacyId, newId);
  }
  return normalized;
}

function buildDefinitionAnchorMetadata(graph) {
  const byLocation = new Map();
  const primaryById = new Map();

  for (const [id, sources] of graph.definitions.entries()) {
    const locations = [...sources]
      .map((source) => parseSourceLocation(source))
      .filter(Boolean)
      .sort(compareSourceLocation);
    if (!locations.length) {
      continue;
    }
    primaryById.set(id, locations[0]);

    for (const location of locations) {
      const key = `${location.file}:${location.line}`;
      if (!byLocation.has(key)) {
        byLocation.set(key, []);
      }
      byLocation.get(key).push({
        id,
        anchor: `${id}--L${location.line}`,
        isPrimary: isSameLocation(location, locations[0])
      });
    }
  }

  for (const entries of byLocation.values()) {
    entries.sort((left, right) => left.id.localeCompare(right.id));
  }

  return { byLocation, primaryById };
}

function renderNodeLink(graph, id, pagePath) {
  const node = graph.nodes.get(id);
  const label = node?.label ?? id;
  const compactLabel =
    label.startsWith(`${id} `) && label.length > id.length + 1
      ? label.slice(id.length + 1)
      : label === id
        ? ""
        : label;
  const targetPath = getNodeHtmlPath(id);

  if (!targetPath) {
    if (compactLabel) {
      return `<code>${escapeHtml(id)}</code> <span class="muted">${escapeHtml(compactLabel)}</span>`;
    }
    return `<code>${escapeHtml(id)}</code>`;
  }

  const href = getRelativeHref(pagePath, targetPath);
  const labelSuffix = compactLabel ? ` <span class="muted">${escapeHtml(compactLabel)}</span>` : "";
  return `<a href="${escapeHtml(href)}"><code>${escapeHtml(id)}</code></a>${labelSuffix}`;
}

function renderIdLinkedText(value, graph, pagePath) {
  const regex = new RegExp(ID_REGEX.source, "g");
  let cursor = 0;
  let output = "";

  for (const match of value.matchAll(regex)) {
    const id = match[0];
    const normalizedId = normalizeId(id);
    const index = match.index ?? 0;
    output += escapeHtml(value.slice(cursor, index));

    if (isValidId(normalizedId) && graph.nodes.has(normalizedId)) {
      const targetPath = getNodeHtmlPath(normalizedId);
      if (targetPath) {
        const href = getRelativeHref(pagePath, targetPath);
        output += `<a href="${escapeHtml(href)}">${escapeHtml(normalizedId)}</a>`;
      } else {
        output += escapeHtml(normalizedId);
      }
    } else {
      output += escapeHtml(id);
    }
    cursor = index + id.length;
  }

  output += escapeHtml(value.slice(cursor));
  return output;
}

function getSortedDefinitionLocations(graph, id) {
  return [...(graph.definitions.get(id) ?? [])]
    .map((source) => parseSourceLocation(source))
    .filter(Boolean)
    .sort(compareSourceLocation);
}

function getNeighborGroups(graph, nodeId) {
  const neighborIds = new Set([...(graph.outgoing.get(nodeId) ?? []), ...(graph.incoming.get(nodeId) ?? [])]);
  neighborIds.delete(nodeId);

  const groups = new Map();
  for (const neighborId of neighborIds) {
    const type = getType(neighborId);
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type).push(neighborId);
  }

  for (const ids of groups.values()) {
    ids.sort((left, right) => left.localeCompare(right));
  }
  return groups;
}

function getPreferredTypeOrder(typeKeys) {
  return [...typeKeys].sort((left, right) => {
    const rankCompare = (TYPE_ORDER[left] ?? 999) - (TYPE_ORDER[right] ?? 999);
    if (rankCompare !== 0) {
      return rankCompare;
    }
    return left.localeCompare(right);
  });
}

function renderNodeList(graph, nodeIds, pagePath, emptyMessage = "なし") {
  if (!nodeIds.length) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }
  const items = nodeIds.map((id) => `<li>${renderNodeLink(graph, id, pagePath)}</li>`);
  return `<ul>\n${items.join("\n")}\n</ul>`;
}

function renderDefinitionLinks(graph, sourceFiles, id, pagePath, definitionAnchors) {
  const locations = getSortedDefinitionLocations(graph, id);
  if (!locations.length) {
    return `<p class="muted">定義位置が見つかりませんでした。</p>`;
  }

  const primary = definitionAnchors.primaryById.get(id);
  const items = locations.map((location) => {
    const rawLine = sourceFiles.get(location.file)?.[location.line - 1] ?? "";
    const snippet = truncateText(normalizeLegacyIdsInText(rawLine.trim()));
    const fragment = primary && isSameLocation(primary, location) ? id : `${id}--L${location.line}`;
    const href = getRelativeHref(pagePath, getSourceHtmlPath(location.file), fragment);
    return `<li><a href="${escapeHtml(href)}"><code>${escapeHtml(`${location.file}:${location.line}`)}</code></a> <span class="muted">${escapeHtml(snippet)}</span></li>`;
  });
  return `<ul>\n${items.join("\n")}\n</ul>`;
}

function renderHtmlPage({ title, pagePath, lead = "", sections }) {
  const indexHref = getRelativeHref(pagePath, path.join(generatedHtmlRoot, "index.html"));
  const markdownIndexHref = getRelativeHref(pagePath, path.join(generatedRoot, "index.md"));
  const sectionHtml = sections.join("\n");
  const leadHtml = lead ? `<p class="lead">${escapeHtml(lead)}</p>` : "";

  return [
    "<!doctype html>",
    "<html lang=\"ja\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    `  <title>${escapeHtml(title)}</title>`,
    "  <style>",
    "    :root { color-scheme: light; }",
    "    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f6f8fb; color: #1f2937; }",
    "    .top-nav { display: flex; gap: 16px; padding: 14px 20px; border-bottom: 1px solid #d7deea; background: #ffffff; }",
    "    .top-nav a { color: #0f4acb; text-decoration: none; font-weight: 600; }",
    "    .top-nav a:hover { text-decoration: underline; }",
    "    main { max-width: 1180px; margin: 0 auto; padding: 24px 20px 40px; }",
    "    h1 { margin: 0 0 12px; font-size: 1.6rem; }",
    "    h2 { margin: 0 0 10px; font-size: 1.1rem; }",
    "    .lead { margin: 0 0 18px; color: #4b5563; }",
    "    .card { background: #ffffff; border: 1px solid #d7deea; border-radius: 10px; padding: 16px; margin-bottom: 14px; }",
    "    ul { margin: 8px 0 0; padding-left: 1.2rem; }",
    "    ol { margin: 8px 0 0; padding-left: 1.4rem; }",
    "    li { margin: 4px 0; }",
    "    a { color: #0f4acb; text-decoration: none; }",
    "    a:hover { text-decoration: underline; }",
    "    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: #eef3ff; border-radius: 4px; padding: 1px 4px; }",
    "    .muted { color: #6b7280; font-size: 0.92rem; }",
    "    .source-table { width: 100%; border-collapse: collapse; table-layout: fixed; }",
    "    .source-table td { border-bottom: 1px solid #e5e7eb; vertical-align: top; padding: 2px 8px; }",
    "    .source-table .line { width: 82px; text-align: right; color: #6b7280; background: #ffffff; }",
    "    .source-table .line a { color: #6b7280; }",
    "    .source-table .code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre; overflow-wrap: anywhere; }",
    "    .pill { display: inline-block; border: 1px solid #d7deea; border-radius: 999px; padding: 2px 8px; font-size: 0.78rem; color: #475569; margin-right: 6px; }",
    "  </style>",
    "</head>",
    "<body>",
    `  <nav class="top-nav"><a href="${escapeHtml(indexHref)}">HTML Index</a><a href="${escapeHtml(markdownIndexHref)}">Markdown Index</a></nav>`,
    "  <main>",
    `    <h1>${escapeHtml(title)}</h1>`,
    `    ${leadHtml}`,
    `    ${sectionHtml}`,
    "  </main>",
    "</body>",
    "</html>"
  ].join("\n");
}

function buildHtmlIndex(graph, issues) {
  const pagePath = path.join(generatedHtmlRoot, "index.html");
  const journeys = getSortedNodes(graph, (node) => node.type === "JRN").map((node) => node.id);
  const screens = getSortedNodes(graph, (node) => node.type === "SCR").map((node) => node.id);
  const frIds = getSortedNodes(graph, (node) => node.type === "FR").map((node) => node.id);
  const atIds = getSortedNodes(graph, (node) => node.type === "AT").map((node) => node.id);
  const featuredJourneyId = journeys.find((id) => id === "JRN-001-CSV") ?? journeys[0] ?? null;
  const featuredJourneyHref = featuredJourneyId
    ? getRelativeHref(pagePath, path.join(generatedHtmlRoot, "journeys", `${featuredJourneyId}.html`))
    : null;

  const summarySection = [
    "<section class=\"card\">",
    "  <h2>生成情報</h2>",
    `  <p><span class="pill">source: scripts/docs-map.mjs</span><span class="pill">generated: ${escapeHtml(new Date().toISOString())}</span><span class="pill">issues: ${issues.length}</span></p>`,
    "</section>"
  ].join("\n");

  const reviewOrderSection = [
    "<section class=\"card\">",
    "  <h2>レビュー順</h2>",
    "  <ol>",
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, path.join(generatedRoot, "consistency-report.md")))}">consistency-report.md</a> でP0/P1確認</li>`,
    featuredJourneyId && featuredJourneyHref
      ? `    <li><a href="${escapeHtml(featuredJourneyHref)}">${escapeHtml(featuredJourneyId)}</a> など対象動線をHTMLで確認</li>`
      : "    <li>対象動線をHTMLで確認</li>",
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, path.join(generatedRoot, "traceability.md")))}">traceability.md</a> で FR -&gt; AT -&gt; Test を確認</li>`,
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, getSourceHtmlPath("docs/requirements/09_user_journeys.md")))}">09_user_journeys.md</a> 原文で最終確認</li>`,
    "  </ol>",
    "</section>"
  ].join("\n");

  const journeyItems = journeys.map((id) => `<li>${renderNodeLink(graph, id, pagePath)}</li>`);
  const journeySection = [
    "<section class=\"card\">",
    "  <h2>ジャーニー別（HTML）</h2>",
    `  <ul>\n${journeyItems.join("\n")}\n  </ul>`,
    "</section>"
  ].join("\n");

  const screenItems = screens.map((id) => `<li>${renderNodeLink(graph, id, pagePath)}</li>`);
  const screenSection = [
    "<section class=\"card\">",
    "  <h2>画面別（HTML）</h2>",
    `  <ul>\n${screenItems.join("\n")}\n  </ul>`,
    "</section>"
  ].join("\n");

  const targetFrs = frIds.filter((id) => /^FR-0(2[0-4]|82A)$/.test(id));
  const targetAts = atIds.filter((id) => /^(AT-CSV-00[1-4]|AT-API-003)$/.test(id));
  const quickIds = [...targetFrs, ...targetAts];
  const quickSection = [
    "<section class=\"card\">",
    `  <h2>${escapeHtml(featuredJourneyId ?? "クイック")} クイックリンク</h2>`,
    renderNodeList(graph, quickIds, pagePath, "該当IDが見つかりませんでした。"),
    "</section>"
  ].join("\n");

  const sourceSection = [
    "<section class=\"card\">",
    "  <h2>原文ドキュメント（HTML化）</h2>",
    "  <ul>",
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, getSourceHtmlPath("docs/requirements/05_functional_requirements.md")))}"><code>docs/requirements/05_functional_requirements.md</code></a></li>`,
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, getSourceHtmlPath("docs/requirements/07_acceptance_tests.md")))}"><code>docs/requirements/07_acceptance_tests.md</code></a></li>`,
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, getSourceHtmlPath("docs/requirements/09_user_journeys.md")))}"><code>docs/requirements/09_user_journeys.md</code></a></li>`,
    `    <li><a href="${escapeHtml(getRelativeHref(pagePath, getSourceHtmlPath("test/specs/traceability-matrix.md")))}"><code>test/specs/traceability-matrix.md</code></a></li>`,
    "  </ul>",
    "</section>"
  ].join("\n");

  return renderHtmlPage({
    title: "ドキュメント可視化インデックス（HTML）",
    pagePath,
    lead: "JRN起点で FR / AT / 原文定義位置へ1クリックで遷移できます。",
    sections: [summarySection, reviewOrderSection, quickSection, journeySection, screenSection, sourceSection]
  });
}

function buildJourneyHtml(graph, sourceFiles, journeyId, definitionAnchors) {
  const pagePath = path.join(generatedHtmlRoot, "journeys", `${journeyId}.html`);
  const node = graph.nodes.get(journeyId);
  const groups = getNeighborGroups(graph, journeyId);

  const sections = [];
  sections.push([
    "<section class=\"card\">",
    "  <h2>対応FR</h2>",
    renderNodeList(graph, groups.get("FR") ?? [], pagePath, "接続されていません。"),
    "</section>"
  ].join("\n"));

  sections.push([
    "<section class=\"card\">",
    "  <h2>対応AT</h2>",
    renderNodeList(graph, groups.get("AT") ?? [], pagePath, "接続されていません。"),
    "</section>"
  ].join("\n"));

  sections.push([
    "<section class=\"card\">",
    "  <h2>画面と操作</h2>",
    "  <h3>SCR</h3>",
    renderNodeList(graph, groups.get("SCR") ?? [], pagePath, "接続されていません。"),
    "  <h3>ACT</h3>",
    renderNodeList(graph, groups.get("ACT") ?? [], pagePath, "接続されていません。"),
    "</section>"
  ].join("\n"));

  sections.push([
    "<section class=\"card\">",
    "  <h2>定義位置</h2>",
    renderDefinitionLinks(graph, sourceFiles, journeyId, pagePath, definitionAnchors),
    "</section>"
  ].join("\n"));

  sections.push([
    "<section class=\"card\">",
    "  <h2>補助リンク</h2>",
    `  <ul><li><a href="${escapeHtml(getRelativeHref(pagePath, path.join(generatedRoot, "journeys", `${journeyId}.md`)))}">${escapeHtml(`${journeyId}.md`)}</a></li></ul>`,
    "</section>"
  ].join("\n"));

  return renderHtmlPage({
    title: `${journeyId} 詳細`,
    pagePath,
    lead: node?.label ?? journeyId,
    sections
  });
}

function buildScreenHtml(graph, sourceFiles, screenId, definitionAnchors) {
  const pagePath = path.join(generatedHtmlRoot, "screens", `${screenId}.html`);
  const node = graph.nodes.get(screenId);
  const groups = getNeighborGroups(graph, screenId);

  const orderedTypes = ["JRN", "ACT", "FC", "UI", "DATA", "AT", "E2E"];
  const relationSections = orderedTypes.map((type) => {
    return [
      `<h3>${escapeHtml(type)}</h3>`,
      renderNodeList(graph, groups.get(type) ?? [], pagePath, "接続されていません。")
    ].join("\n");
  });

  const sections = [
    [
      "<section class=\"card\">",
      "  <h2>関連ノード</h2>",
      relationSections.join("\n"),
      "</section>"
    ].join("\n"),
    [
      "<section class=\"card\">",
      "  <h2>定義位置</h2>",
      renderDefinitionLinks(graph, sourceFiles, screenId, pagePath, definitionAnchors),
      "</section>"
    ].join("\n"),
    [
      "<section class=\"card\">",
      "  <h2>補助リンク</h2>",
      `  <ul><li><a href="${escapeHtml(getRelativeHref(pagePath, path.join(generatedRoot, "screens", `${screenId}.md`)))}">${escapeHtml(`${screenId}.md`)}</a></li></ul>`,
      "</section>"
    ].join("\n")
  ];

  return renderHtmlPage({
    title: `${screenId} 詳細`,
    pagePath,
    lead: node?.label ?? screenId,
    sections
  });
}

function buildIdHtml(graph, sourceFiles, id, definitionAnchors) {
  const pagePath = path.join(generatedHtmlRoot, "ids", `${id}.html`);
  const node = graph.nodes.get(id);
  const groups = getNeighborGroups(graph, id);
  const type = getType(id);

  const preferredOrder =
    type === "FR"
      ? ["JRN", "AT", "E2E", "UT", "VR", "SCR", "ACT", "FC"]
      : type === "AT"
        ? ["JRN", "FR", "E2E", "VR", "UT", "SCR", "ACT", "FC"]
        : getPreferredTypeOrder(groups.keys());

  const relationBlocks = preferredOrder
    .filter((groupType) => (groups.get(groupType) ?? []).length > 0)
    .map((groupType) => {
      return [
        `<h3>${escapeHtml(groupType)}</h3>`,
        renderNodeList(graph, groups.get(groupType) ?? [], pagePath, "接続されていません。")
      ].join("\n");
    });

  if (!relationBlocks.length) {
    relationBlocks.push("<p class=\"muted\">接続ノードはありません。</p>");
  }

  const sections = [
    [
      "<section class=\"card\">",
      "  <h2>定義文（抜粋）</h2>",
      `  <p>${escapeHtml(truncateText(node?.label ?? id, 240))}</p>`,
      "</section>"
    ].join("\n"),
    [
      "<section class=\"card\">",
      "  <h2>原文リンク</h2>",
      renderDefinitionLinks(graph, sourceFiles, id, pagePath, definitionAnchors),
      "</section>"
    ].join("\n"),
    [
      "<section class=\"card\">",
      "  <h2>関連ノード</h2>",
      relationBlocks.join("\n"),
      "</section>"
    ].join("\n")
  ];

  return renderHtmlPage({
    title: `${id} 詳細`,
    pagePath,
    lead: `${type} ID`,
    sections
  });
}

function buildSourceHtml(relativeFile, lines, graph, definitionAnchors) {
  const pagePath = getSourceHtmlPath(relativeFile);
  const rows = [];

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const lineText = lines[index];
    const key = `${relativeFile}:${lineNumber}`;
    const anchorEntries = definitionAnchors.byLocation.get(key) ?? [];
    const anchors = anchorEntries
      .map((entry) => {
        const primaryAnchor = entry.isPrimary ? `<a id="${escapeHtml(entry.id)}"></a>` : "";
        return `<a id="${escapeHtml(entry.anchor)}"></a>${primaryAnchor}`;
      })
      .join("");

    const rendered = renderIdLinkedText(lineText, graph, pagePath);
    rows.push([
      `<tr id="L${lineNumber}">`,
      `  <td class="line"><a href="#L${lineNumber}">${lineNumber}</a></td>`,
      `  <td class="code">${anchors}${rendered || "&nbsp;"}</td>`,
      "</tr>"
    ].join("\n"));
  }

  const sections = [
    [
      "<section class=\"card\">",
      `  <h2><code>${escapeHtml(relativeFile)}</code></h2>`,
      `  <table class="source-table">\n${rows.join("\n")}\n  </table>`,
      "</section>"
    ].join("\n")
  ];

  return renderHtmlPage({
    title: `${relativeFile} ソース表示`,
    pagePath,
    lead: "行番号とIDアンカー付きで参照できます。",
    sections
  });
}

async function generateHtmlArtifacts(graph, issues, sourceFiles) {
  await fs.rm(generatedHtmlRoot, { recursive: true, force: true });

  const definitionAnchors = buildDefinitionAnchorMetadata(graph);
  const journeys = getSortedNodes(graph, (node) => node.type === "JRN").map((node) => node.id);
  const screens = getSortedNodes(graph, (node) => node.type === "SCR").map((node) => node.id);
  const idNodes = getSortedNodes(graph, (node) => !["JRN", "SCR", "DATA"].includes(node.type)).map((node) => node.id);
  const sourceEntries = [...sourceFiles.entries()].sort((left, right) => left[0].localeCompare(right[0]));

  const indexHtml = buildHtmlIndex(graph, issues);
  await writeFile(path.join(generatedHtmlRoot, "index.html"), indexHtml);

  for (const journeyId of journeys) {
    const journeyHtml = buildJourneyHtml(graph, sourceFiles, journeyId, definitionAnchors);
    await writeFile(path.join(generatedHtmlRoot, "journeys", `${journeyId}.html`), journeyHtml);
  }

  for (const screenId of screens) {
    const screenHtml = buildScreenHtml(graph, sourceFiles, screenId, definitionAnchors);
    await writeFile(path.join(generatedHtmlRoot, "screens", `${screenId}.html`), screenHtml);
  }

  for (const id of idNodes) {
    const idHtml = buildIdHtml(graph, sourceFiles, id, definitionAnchors);
    await writeFile(path.join(generatedHtmlRoot, "ids", `${id}.html`), idHtml);
  }

  for (const [relativeFile, lines] of sourceEntries) {
    const sourceHtml = buildSourceHtml(relativeFile, lines, graph, definitionAnchors);
    await writeFile(getSourceHtmlPath(relativeFile), sourceHtml);
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(targetPath, content) {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, `${content}\n`, "utf8");
}

async function parseAll(graph) {
  const markdownFiles = [
    ...(await walkMarkdownFiles(docsRoot)),
    ...(await walkMarkdownFiles(specsRoot))
  ];
  const sourceFiles = new Map();

  for (const file of markdownFiles.sort()) {
    const relativeFile = path.relative(repoRoot, file).replaceAll(path.sep, "/");
    const raw = await fs.readFile(file, "utf8");
    const content = normalizeNewline(raw);
    const lines = content.split("\n");
    sourceFiles.set(relativeFile, lines);

    parseMarkdownTables(graph, relativeFile, lines);
    parseUiDataPaths(graph, relativeFile, lines);

    for (let index = 0; index < lines.length; index += 1) {
      parseLineDefinitions(graph, relativeFile, index + 1, lines[index]);
    }
    parseRelationships(graph, relativeFile, lines);
  }
  return sourceFiles;
}

async function generateArtifacts(graph, issues, sourceFiles) {
  const overviewMd = buildOverviewMarkdown(graph);
  const traceabilityMd = buildTraceabilityMarkdown(graph);
  const consistencyMd = buildConsistencyReport(graph, issues);
  const indexMd = buildIndexMarkdown(graph, issues);
  const graphJson = buildGraphJson(graph);

  await writeFile(path.join(generatedRoot, "overview.md"), overviewMd);
  await writeFile(path.join(generatedRoot, "traceability.md"), traceabilityMd);
  await writeFile(path.join(generatedRoot, "consistency-report.md"), consistencyMd);
  await writeFile(path.join(generatedRoot, "index.md"), indexMd);
  await writeFile(path.join(generatedRoot, "graph.json"), graphJson);

  const journeys = getSortedNodes(graph, (node) => node.type === "JRN").map((node) => node.id);
  for (const journeyId of journeys) {
    const journeyMd = buildJourneyMarkdown(graph, journeyId);
    await writeFile(path.join(generatedRoot, "journeys", `${journeyId}.md`), journeyMd);
  }

  const screens = getSortedNodes(graph, (node) => node.type === "SCR").map((node) => node.id);
  for (const screenId of screens) {
    const screenMd = buildScreenMarkdown(graph, screenId);
    await writeFile(path.join(generatedRoot, "screens", `${screenId}.md`), screenMd);
  }

  await generateHtmlArtifacts(graph, issues, sourceFiles);
}

function printSummary(graph, issues) {
  const counts = summarizeCounts(graph);
  const summary = Object.keys(counts)
    .sort((a, b) => (TYPE_ORDER[a] ?? 999) - (TYPE_ORDER[b] ?? 999))
    .map((type) => `${type}:${counts[type]}`)
    .join(", ");

  console.log(`[docs-map] nodes=${graph.nodes.size} edges=${graph.edges.size} (${summary})`);
  if (issues.length) {
    const p0 = issues.filter((issue) => issue.severity === "P0").length;
    const p1 = issues.filter((issue) => issue.severity === "P1").length;
    const p2 = issues.filter((issue) => issue.severity === "P2").length;
    console.log(`[docs-map] issues: P0=${p0}, P1=${p1}, P2=${p2}`);
  } else {
    console.log("[docs-map] issues: none");
  }
}

async function main() {
  const graph = createGraph();
  const sourceFiles = await parseAll(graph);
  const issues = collectConsistencyIssues(graph);
  printSummary(graph, issues);

  if (!checkMode) {
    await generateArtifacts(graph, issues, sourceFiles);
    console.log(`[docs-map] generated artifacts in ${path.relative(repoRoot, generatedRoot)}`);
  }

  const hasBlocking = issues.some((issue) => issue.severity === "P0");
  if (checkMode && hasBlocking) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[docs-map] failed:", error);
  process.exitCode = 1;
});
