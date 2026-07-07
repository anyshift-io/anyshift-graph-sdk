export interface Page {
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
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
  [payload: string]: unknown;
}
