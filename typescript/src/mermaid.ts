import type { AskResult, GraphEdge, GraphNode } from "./types.js";

function safeId(id: string, seq: number): string {
  const cleaned = id.replace(/[^A-Za-z0-9_]/g, "_");
  return `n${seq}_${cleaned}`.slice(0, 60);
}

function label(text: string): string {
  return text.replace(/"/g, "'").replace(/[<>|]/g, " ").replace(/\s+/g, " ").trim();
}

function nodeLabel(n: GraphNode): string {
  const type = n.type ? n.type.replace(/^K8S_|^DATADOG_/, "") : "";
  const parts = [label(n.name)];
  if (type) parts.push(`[${label(type)}]`);
  if (n.image) parts.push(label(n.image));
  return parts.join("<br/>");
}

function shaped(id: string, n: GraphNode): string {
  const t = n.type ?? "";
  const l = nodeLabel(n);
  if (t === "DATADOG_DATASTORE") return `${id}[("${l}")]`;
  if (t === "DATADOG_EXTERNAL" || t === "DATADOG_DESTINATION") return `${id}(["${l}"])`;
  return `${id}["${l}"]`;
}

/**
 * Render a topology result as Mermaid text. Dynamic topology renders as a sequence diagram;
 * every other topology level renders as a flowchart.
 */
export function toMermaid(result: AskResult): string {
  const nodes: GraphNode[] = result.nodes ?? [];
  const edges: GraphEdge[] = result.edges ?? [];
  if (!nodes.length) return "";

  const idMap = new Map<string, string>();
  nodes.forEach((n, i) => idMap.set(n.id, safeId(n.id, i)));
  const level = result.topology?.level ?? "container";

  if (level === "dynamic") {
    const lines = ["sequenceDiagram"];
    for (const n of nodes) lines.push(`  participant ${idMap.get(n.id)} as ${label(n.name)}`);
    for (const e of edges) {
      const from = idMap.get(e.from);
      const to = idMap.get(e.to);
      if (from && to) lines.push(`  ${from}->>${to}: ${label(e.type)}`);
    }
    return lines.join("\n");
  }

  const lines = ["flowchart TB"];
  for (const n of nodes) {
    const sid = idMap.get(n.id)!;
    lines.push(`  ${shaped(sid, n)}`);
  }
  for (const e of edges) {
    const from = idMap.get(e.from);
    const to = idMap.get(e.to);
    if (from && to) lines.push(`  ${from} -->|${label(e.type)}| ${to}`);
  }
  return lines.join("\n");
}
