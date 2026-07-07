export interface Page {
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
}

export interface GraphNode {
  id: string;
  anyshiftID?: string | null;
  name: string;
  type?: string | null;
  namespace?: string | null;
  image?: string | null;
  [property: string]: unknown;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
  direction?: string | null;
  [property: string]: unknown;
}

export type C4Level = "context" | "container" | "component" | "dynamic";

export interface TopologyResult {
  resolved?: Record<string, unknown>;
  level?: C4Level;
  nodeCount?: number;
  edgeCount?: number;
  byType?: unknown[];
  [property: string]: unknown;
}

export type GraphIntent =
  | "connections"
  | "inventory"
  | "events"
  | "hotspots"
  | "incident"
  | "failures"
  | "deployments"
  | "audit"
  | "nodes"
  | "access"
  | "servicetree"
  | "exposure"
  | "orphans"
  | "coverage"
  | "slo"
  | "tenancy"
  | "sharedconfig"
  | "alertnoise"
  | "alertrules"
  | "gitops"
  | "image"
  | "netpol"
  | "storage"
  | "pdb"
  | "scaling"
  | "topology"
  | "priority"
  | "path"
  | "cascade"
  | "blast"
  | "spof"
  | "commoncause"
  | "deployimpact"
  | "alertimpact"
  | "monitor"
  | "datastore"
  | "flow"
  | "externaldep"
  | "alerts"
  | "calls"
  | "alertcause";

export interface AskResult {
  question?: string;
  intent: GraphIntent | (string & {});
  summary: string;
  countOnly?: boolean;
  elapsedMs?: number;
  page?: Page;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  topology?: TopologyResult;
  [payload: string]: unknown;
}
