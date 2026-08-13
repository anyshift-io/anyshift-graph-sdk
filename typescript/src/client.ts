import { GraphAnswerError, AuthError, BadQueryError } from "./errors.js";
import type { AskResult, AskResultFor } from "./types.js";
import { GRAPH_SDK_VERSION } from "./version.js";

// Minimal shape we need from fetch — keeps real `fetch` and test stubs both valid
// without depending on DOM/undici Response types.
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string }
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export interface GraphAnswerOptions {
  /** Graph API base URL. Default: https://graph.anyshift.io */
  baseUrl?: string;
  /** Bearer token for the Anyshift Graph API. */
  token?: string;
  /** Anyshift project id. When set, requests use /v1/projects/{project}/... routes. */
  project?: string;
  /** Injectable fetch (for tests). Defaults to global fetch. */
  fetch?: FetchLike;
  /**
   * UUID used to correlate several SDK calls as one caller-defined workflow.
   * When omitted, the SDK creates a new UUID for each request.
   */
  invocationId?: string;
}

export interface ResolveParams {
  /** Resource name or fragment to rank against the current graph. */
  term: string;
  /** Maximum candidates to return. */
  limit?: number;
}

export type Since = "30m" | "1h" | "2h" | "6h" | "12h" | "1d" | "today" | (string & {});

export interface EventsParams {
  type?: string;
  target?: string;
  namespace?: string;
  noise?: "signal" | "all";
  since?: Since;
  limit?: number;
  offset?: number;
}
export interface CloudEventsParams {
  /** Cloud provider. */
  provider?: "aws" | "azure" | "gcp";
  /** AWS account, Azure subscription, or GCP project scope. */
  scope?: string;
  /** Cloud region or provider location. */
  region?: string;
  /** Provider-neutral change category. */
  category?: "security" | "identity" | "lifecycle" | "configuration" | "capacity" | "backup" | "other";
  /** Exact normalized cloud event type. */
  type?: string;
  /** Exact native id, graph id, or unambiguous resource name. */
  resource?: string;
  /** Actor identity, name, or graph id. */
  actor?: string;
  /** Anyshift event-story correlation id. */
  correlation?: string;
  /** Provider-native operation id, such as a GCP operation identifier. */
  operation?: string;
  /** Include high-noise evidence. */
  noise?: "signal" | "all";
  /** Include sanitized before/after values instead of changed field names only. */
  diff?: boolean;
  since?: Since;
  limit?: number;
  /** Opaque seek cursor from the preceding page. */
  cursor?: string;
}
export interface CloudResourcesParams {
  /** Cloud provider. */
  provider?: "aws" | "azure" | "gcp";
  /** AWS account, Azure subscription, or GCP project scope. */
  scope?: string;
  /** Cloud region or provider location. */
  region?: string;
  /** Provider resource type, such as EC2_INSTANCE or COMPUTE_INSTANCES. */
  type?: string;
  /** Exact native id, graph id, or unambiguous resource name. */
  resource?: string;
  lifecycle?: "alive" | "deleted" | "all";
  provenance?: "managed" | "configured" | "unknown";
  freshness?: "fresh" | "stale" | "unknown";
  /** Maximum observation age used for the freshness verdict. */
  maxAge?: Since;
  /** Opaque seek cursor from the preceding page. */
  cursor?: string;
  limit?: number;
}
export interface DeliveryEventsParams {
  stage?: "commit" | "ci" | "release" | "deploy";
  type?: string;
  resource?: string;
  actor?: string;
  source?: string;
  since?: Since;
  cursor?: string;
  limit?: number;
}
export interface EvidenceResourceParams {
  resource: string;
  limit?: number;
}
export interface GraphCoverageParams {
  source?: "kubernetes" | "cloud" | "github" | "datadog" | "tempo" | "dynatrace" | "victoria" | "grafana";
}
export interface ImpactParams {
  /** Root resource whose potential operational impact to evaluate. */
  resource: string;
  /** Maximum traversal depth over reviewed operational edges. Defaults to 2. */
  depth?: 1 | 2 | 3;
  limit?: number;
  offset?: number;
}
export interface IacParams {
  /** Terraform address or Terraform, state, or cloud graph identifier. */
  resource?: string;
  /** IaC linkage status. */
  status?: "managed" | "unlinked" | "missing_cloud" | "ambiguous" | "stale" | "invalid";
  /** Evidence freshness window. */
  freshness?: Since;
  limit?: number;
  offset?: number;
}
export interface IacDriftParams {
  /** Terraform address or Terraform, state, or cloud graph identifier. */
  resource?: string;
  /** Drift verdict. */
  status?: "in_sync" | "drifted" | "unknown";
  /** Evidence freshness window. */
  freshness?: Since;
  limit?: number;
  offset?: number;
}
export interface HotspotsParams {
  type?: string;
  // "resource" | "namespace" rank K8s change events; "alertrule" | "alertworkload" rank the
  // Grafana/Victoria alert-firing stream (ALERT_TRIGGERED/ALERT_RECOVERED) instead.
  by?: "resource" | "namespace" | "alertrule" | "alertworkload";
  namespace?: string;
  since?: Since;
  limit?: number;
}
export interface FeedParams {
  target?: string;
  namespace?: string;
  since?: Since;
  limit?: number;
  offset?: number;
}
export interface AuditParams extends FeedParams {
  type?: string;
}
export interface NodeParams {
  target?: string;
  since?: Since;
  limit?: number;
  offset?: number;
}
export interface DeployImpactParams {
  /** A workload to drill into; omit for the ranked "riskiest recent deploys". */
  target?: string;
  since?: Since;
  /** Ranked-mode row cap. */
  limit?: number;
}
export interface CommonCauseParams {
  /** Restrict the failures considered to a namespace; omit for cluster-wide. */
  namespace?: string;
  since?: Since;
  /** Top-N shared resources per dimension (node / workload). */
  limit?: number;
}
export interface BlastParams {
  /** The resource whose transitive impact to compute (configmap, node, SA, workload, …). */
  resource: string;
  /** Top-N workloads / services to return. */
  limit?: number;
}
export interface SpofParams {
  /** Which resource kind to rank as a single point of failure (default "configmap"). */
  kind?: "configmap" | "serviceaccount" | "node";
  /** Restrict to a namespace (ignored for nodes). */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface OrphansParams {
  /** Which resource kind to flag as unused / dangling (default "configmap"). */
  kind?: "configmap" | "serviceaccount" | "role" | "replicaset";
  /** Restrict to a namespace. */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface CoverageParams {
  /**
   * Which blind-spot set to enumerate (default "service" = no Datadog presence at all).
   * "monitor" = bridged Datadog services nobody alerts on; "metrics" = workloads whose
   * metrics ship nowhere (no VictoriaMetrics remote-write destination).
   */
  kind?: "service" | "monitor" | "metrics";
  /** Restrict to a namespace (or a service-name substring for the monitor kind). */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface GitopsParams {
  /** Which mode over the ArgoCD/GitOps layer to run (default "drift"). */
  subject?: "drift" | "unmanaged" | "owner";
  /** For subject "owner": the workload to resolve to its owning application (required for owner). */
  resource?: string;
  /** For subject "drift"/"unmanaged": restrict to a namespace. */
  namespace?: string;
  /** Top-N rows (drift / unmanaged). */
  limit?: number;
}
export interface NetpolParams {
  /** Which NetworkPolicy mode (default "uncovered" = the default-allow namespace ranking). */
  mode?: "uncovered" | "policy" | "segmentation";
  /** policy/segmentation: the workload (or namespace, policy only) whose policies / reach to resolve. */
  target?: string;
  /** uncovered: restrict the ranking to a namespace substring. */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface PriorityParams {
  /**
   * Which scheduling-priority mode (default "nopriority" = the ranking of workloads with no priority
   * class, first evicted under node pressure). "ladder" = the priority-class ladder by value.
   */
  kind?: "nopriority" | "ladder";
  /** target mode: a workload/pod to resolve to its own priority class + value. */
  target?: string;
  /** nopriority: restrict the ranking to a namespace substring. */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface StorageParams {
  /**
   * Which mode over the PV/PVC/StorageClass layer (default "footprint" = a named workload/pod's chain).
   * "orphanpv" = PVs bound to no PVC (cost leak); "unclaimedpvc" = PVCs no pod claims; "byclass" = what
   * a storageclass backs.
   */
  mode?: "footprint" | "orphanpv" | "unclaimedpvc" | "byclass";
  /** footprint: the workload or pod whose storage chain to resolve (required for footprint). */
  workload?: string;
  /** orphanpv / byclass: restrict to a storageclass by name substring (byclass empty = the ranking). */
  class?: string;
  /** unclaimedpvc: restrict to a namespace substring. */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface PdbParams {
  /** A workload or PodDisruptionBudget name to drill into; omit for the no-PDB blind-spot list. */
  target?: string;
  limit?: number;
}
export interface ScalingParams {
  /**
   * Which mode over the HPA / SCALES layer (default "nohpa" = workloads no HPA scales, the
   * autoscaler blind spots). "autoscaled" = workloads that DO have an HPA; "target" = resolve
   * a named workload → its HPA, or a named HPA → what it scales.
   */
  mode?: "nohpa" | "autoscaled" | "target";
  /** target mode: the workload or HPA name to resolve (required for target). */
  target?: string;
  /** nohpa/autoscaled: restrict the list to a namespace substring. */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface AccessParams {
  /**
   * reach mode: the subject (pod / workload / service account) OR role name whose RBAC reach to
   * compute. privileged mode: optional namespace substring to scope the ranking to (omit for all).
   */
  resource?: string;
  /**
   * "reach" (default) resolves `resource` and walks the chain (what it can do / who can reach it);
   * "privileged" ranks the over-privileged serviceaccounts (wildcard/secrets/cluster-scoped grants).
   */
  mode?: "reach" | "privileged";
  /** Top-N rows (subjects in object reach; over-privileged SAs in privileged mode). */
  limit?: number;
}
export interface ExposureParams {
  /** Stable id, legacy name, or a type-qualified resource selector to trace. */
  resource: ResourceSelector;
  /** Opaque cursor returned by the preceding canonical exposure page. */
  cursor?: string;
  /** Top-N exposure paths to return. */
  limit?: number;
}
export interface TenancyParams {
  /** The workload or node whose co-located (same-node) neighbors to list. */
  resource: string;
  /** Top-N co-located workloads to return. */
  limit?: number;
}
export interface SharedConfigParams {
  /** The workload or configmap whose config-coupled (same-configmap) siblings to list. */
  resource: string;
  /** Top-N config-coupled workloads to return. */
  limit?: number;
}
export type ResourceSelector =
  | string
  | { id: string; name?: never; type?: never; namespace?: never; cluster?: never }
  | { id?: never; name: string; type: string; namespace?: string; cluster?: string };
export interface PathParams {
  /** The first resource (start of the path). */
  from: ResourceSelector;
  /** The second resource (end of the path). */
  to: ResourceSelector;
  /** Include APM identity and dependency edges when set to operational. */
  scope?: "infrastructure" | "operational";
}
export interface CascadeParams {
  /** A resource/app involved in the incident (resolves to its latest correlation group). */
  target?: string;
  /** A correlation id, if known. */
  id?: string;
}
export interface AlertImpactParams {
  /** The resource (node/workload/configmap…) whose Datadog monitor/SLO impact to compute. */
  resource: string;
}
export interface MonitorParams {
  /** A Datadog monitor/alert name (matched by substring). */
  target: string;
}
export type ApmSource = "auto" | "datadog" | "tempo" | "dynatrace";
export type TopologySource = ApmSource | "configuration";
export interface DataStoreParams {
  /** A datastore name to drill into; omit for the ranked top datastores. */
  target?: string;
  source?: ApmSource;
  limit?: number;
}
export interface FlowParams {
  /** A topic/stream (destination) name to drill into; omit for the ranked busiest streams. */
  target?: string;
  source?: ApmSource;
  limit?: number;
}
export interface ExternalDepParams {
  /** An external host (e.g. "nexmo.com") to drill into; omit for the ranked external deps. */
  target?: string;
  source?: ApmSource;
  limit?: number;
}
export interface AlertsParams {
  /** A service/workload to scope to; omit for all firing monitors. */
  target?: string;
  limit?: number;
}
export interface SloParams {
  /** An SLO name to check (substring); omit for the ranked breaching/at-risk SLOs. */
  target?: string;
  limit?: number;
}
export interface AlertNoiseParams {
  /** A service/namespace to scope to; omit for the cluster-wide noisiest ranking. */
  target?: string;
  /** Filter to one noise class: "flapping" (self-resolving) or "stuck" (never recovers). */
  kind?: "flapping" | "stuck";
  /** How far back the churn window runs (default: the whole stream). */
  since?: Since;
  limit?: number;
}
export interface CallsParams {
  /** A service to drill into (callers + callees); omit for the ranked most-called services. */
  target?: string;
  source?: ApmSource;
  limit?: number;
}
export interface ServiceTreeParams {
  /** A service to expand into its full transitive downstream tree; omit for the ranked footprints. */
  target?: string;
  source?: ApmSource;
  limit?: number;
}
export interface ImageParams {
  /** An image name/repo/tag whose runners to find (the CVE blast radius); omit for the ranked top images. */
  target?: string;
  /** Exact running image digest. Mutually exclusive with target, workload, kind, and namespace. */
  digest?: string;
  /** A workload whose own container images + resource requests/limits to list (forces the target view). */
  workload?: string;
  /** A container-hygiene scan instead of a lookup: "nomemlimit" | "nocpurequest" | "skew". */
  kind?: "nomemlimit" | "nocpurequest" | "skew";
  /** Restrict a hygiene scan to a namespace / workload. */
  namespace?: string;
  /** Top-N rows. */
  limit?: number;
}
export interface AlertCauseParams {
  /** The firing/alerting service or workload to explain. */
  target: string;
  /** How far back to look for the K8s change that caused it (default 6h). */
  since?: Since;
  limit?: number;
}
export interface AlertRulesParams {
  /** Which Grafana/Victoria mode: "coverage" (default, the gap list), "inventory", or "target". */
  subject?: "coverage" | "inventory" | "target";
  /** Restrict coverage/inventory to a namespace (substring); ignored in target mode. */
  namespace?: string;
  /** The service/workload to drill into; required when subject = "target". */
  target?: string;
  limit?: number;
}
interface TopologyParamsBase {
  /** The service (or K8s workload it bridges to) to diagram. */
  service: string;
  /**
   * The C4 level controlling depth + which node classes appear (default "container"):
   * "context" (service + direct collaborators), "container" (runtime containers + workloads +
   * datastores/queues/externals), "component" (component roll-down incl. config), "dynamic"
   * (ordered call flow).
   */
  level?: "context" | "container" | "component" | "dynamic";
}

export type TopologyParams = TopologyParamsBase & (
  | { source?: ApmSource; endpoint?: never; dependency?: never }
  | { source: "configuration"; endpoint?: string; dependency?: never }
  | { source: "configuration"; endpoint: string; dependency: string }
);

// Single-quote a value for the query language; strip embedded quotes.
function lit(v: string): string {
  return `'${String(v).replace(/'/g, "")}'`;
}

// Build "SELECT * FROM <table>[ WHERE k = 'v' AND ...][ LIMIT n][ OFFSET m]" from ordered conditions.
function compose(
  table: string,
  conds: Array<[string, string | number | undefined]>,
  limit?: number,
  offset?: number
): string {
  const where = conds
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k} = ${lit(String(v))}`);
  let sql = `SELECT * FROM ${table}`;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  if (limit !== undefined) sql += ` LIMIT ${Math.floor(limit)}`;
  if (offset !== undefined) sql += ` OFFSET ${Math.floor(offset)}`;
  return sql;
}

function selectorConditions(prefix: "from" | "to", selector: ResourceSelector): Array<[string, string]> {
  if (typeof selector === "string") return [[prefix, selector]];
  if (selector.id !== undefined) return [[`${prefix}_id`, selector.id]];
  return [
    [prefix, selector.name],
    [`${prefix}_exact`, "true"],
    [`${prefix}_type`, selector.type],
    [`${prefix}_namespace`, selector.namespace ?? ""],
    [`${prefix}_cluster`, selector.cluster ?? ""],
  ];
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function exposureSelectorConditions(selector: ResourceSelector): Array<[string, string]> {
  if (typeof selector === "string") {
    if (!nonEmptyString(selector)) throw new TypeError("exposure resource must be a non-empty string or selector");
    return [["resource", selector]];
  }
  if (!selector || typeof selector !== "object" || Array.isArray(selector)) {
    throw new TypeError("exposure resource must be a non-empty string or selector");
  }

  const value = selector as Record<string, unknown>;
  const keys = Object.keys(value);
  if ("id" in value) {
    if (!nonEmptyString(value.id) || keys.some((key) => key !== "id")) {
      throw new TypeError("exposure id selector must contain only a non-empty id");
    }
    return [["resource_id", value.id]];
  }

  const allowed = new Set(["name", "type", "namespace", "cluster"]);
  if (
    keys.some((key) => !allowed.has(key))
    || !nonEmptyString(value.name)
    || !nonEmptyString(value.type)
    || (value.namespace !== undefined && !nonEmptyString(value.namespace))
    || (value.cluster !== undefined && !nonEmptyString(value.cluster))
  ) {
    throw new TypeError("exposure name selector requires non-empty name and type with optional namespace and cluster");
  }
  return [
    ["resource", value.name],
    ["resource_type", value.type],
    ["resource_namespace", value.namespace ?? ""],
    ["resource_cluster", value.cluster ?? ""],
  ] as Array<[string, string]>;
}

function isCanonicalExposureResult(result: AskResult): result is AskResultFor<"exposure"> {
  if (result.intent !== "exposure") return false;
  const exposure = (result as { exposure?: unknown }).exposure;
  if (!exposure || typeof exposure !== "object" || Array.isArray(exposure)) return false;
  const required = ["direction", "exposed", "services", "ingresses", "perspective", "verdict", "subject", "candidates", "paths", "page"];
  return required.every((field) => Object.prototype.hasOwnProperty.call(exposure, field));
}

function generateInvocationId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function typedQueryStep(sql: string): string | undefined {
  return /^SELECT \* FROM ([a-z_]+)(?:\s|$)/.exec(sql)?.[1];
}

export class GraphAnswer {
  private baseUrl: string;
  private token?: string;
  private project?: string;
  private fetchImpl: FetchLike;
  private invocationId?: string;

  constructor(opts: GraphAnswerOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? "https://graph.anyshift.io").replace(/\/$/, "");
    this.token = opts.token;
    this.project = opts.project;
    this.fetchImpl = opts.fetch ?? (fetch as unknown as FetchLike);
    if (opts.invocationId && !UUID_PATTERN.test(opts.invocationId)) {
      throw new TypeError("invocationId must be a UUID");
    }
    this.invocationId = opts.invocationId;
  }

  private routePath(kind: "ask" | "query"): string {
    if (!this.project) return `/v1/${kind}`;
    return `/v1/projects/${encodeURIComponent(this.project)}/${kind}`;
  }

  /** Raw query-language escape hatch (deterministic, no LLM). */
  query(sql: string): Promise<AskResult> {
    return this.post(this.routePath("query"), { sql }, "query");
  }

  /** Natural-language escape hatch (one server-side LLM routing call). */
  ask(question: string): Promise<AskResult> {
    return this.post(this.routePath("ask"), { question }, "ask");
  }

  private typedQuery(sql: string): Promise<AskResult> {
    return this.post(this.routePath("query"), { sql }, "typed-query", typedQueryStep(sql));
  }

  resolve(p: ResolveParams): Promise<AskResult> {
    return this.typedQuery(compose("resolve", [["term", p.term]], p.limit));
  }

  connections(p: { resource: string }): Promise<AskResult> {
    return this.typedQuery(compose("connections", [["resource", p.resource]]));
  }

  inventory(p: { type: string }): Promise<AskResult> {
    return this.typedQuery(compose("resources", [["type", p.type]]));
  }

  events(p: EventsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("events", [
      ["type", p.type],
      ["target", p.target],
      ["namespace", p.namespace],
      ["noise", p.noise === "all" ? "all" : undefined],
      ["since", p.since],
    ], p.limit, p.offset));
  }

  /** Evidence-backed AWS, Azure, and GCP change events with keyset pagination. */
  cloudEvents(p: CloudEventsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("cloud_events", [
      ["provider", p.provider],
      ["scope", p.scope],
      ["region", p.region],
      ["category", p.category],
      ["type", p.type],
      ["resource", p.resource],
      ["actor", p.actor],
      ["correlation", p.correlation],
      ["operation", p.operation],
      ["noise", p.noise === "all" ? "all" : undefined],
      ["diff", p.diff === true ? "true" : undefined],
      ["since", p.since],
      ["cursor", p.cursor],
    ], p.limit));
  }

  /** Current and retained cloud inventory with freshness and IaC provenance evidence. */
  cloudResources(p: CloudResourcesParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("cloud_resources", [
      ["provider", p.provider],
      ["scope", p.scope],
      ["region", p.region],
      ["type", p.type],
      ["resource", p.resource],
      ["lifecycle", p.lifecycle],
      ["provenance", p.provenance],
      ["freshness", p.freshness],
      ["max_age", p.maxAge],
      ["cursor", p.cursor],
    ], p.limit));
  }

  /** Commit, CI, release, and deployment evidence from the delivery graph. */
  deliveryEvents(p: DeliveryEventsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("delivery_events", [
      ["stage", p.stage],
      ["type", p.type],
      ["resource", p.resource],
      ["actor", p.actor],
      ["source", p.source],
      ["since", p.since],
      ["cursor", p.cursor],
    ], p.limit));
  }

  /** Stored release-to-commit-to-actor provenance; missing joins remain unknown. */
  provenance(p: EvidenceResourceParams): Promise<AskResult> {
    return this.typedQuery(compose("provenance", [["resource", p.resource]], p.limit));
  }

  /** Observed OWNS_CODE edges and linked contact identities. */
  ownership(p: EvidenceResourceParams): Promise<AskResult> {
    return this.typedQuery(compose("ownership", [["resource", p.resource]], p.limit));
  }

  /** Current observed evidence by graph source; absence is not integration state. */
  graphCoverage(p: GraphCoverageParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("graph_coverage", [["source", p.source]]));
  }

  /** Potential operational impact over a reviewed directional edge allowlist. */
  impact(p: ImpactParams): Promise<AskResult> {
    return this.typedQuery(compose("operational_impact", [
      ["resource", p.resource],
      ["depth", p.depth],
    ], p.limit, p.offset));
  }

  hotspots(p: HotspotsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("hotspots", [
      ["type", p.type],
      ["by", p.by],
      ["namespace", p.namespace],
      ["since", p.since],
    ], p.limit));
  }

  incident(p: { target?: string; id?: string }): Promise<AskResult> {
    return this.typedQuery(compose("incidents", [
      ["id", p.id],
      ["target", p.target],
    ]));
  }

  failures(p: FeedParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("failures", [
      ["target", p.target],
      ["namespace", p.namespace],
      ["since", p.since],
    ], p.limit, p.offset));
  }

  deployments(p: FeedParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("deployments", [
      ["target", p.target],
      ["namespace", p.namespace],
      ["since", p.since],
    ], p.limit, p.offset));
  }

  audit(p: AuditParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("audit", [
      ["target", p.target],
      ["namespace", p.namespace],
      ["type", p.type],
      ["since", p.since],
    ], p.limit, p.offset));
  }

  nodes(p: NodeParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("nodes", [
      ["target", p.target],
      ["since", p.since],
    ], p.limit, p.offset));
  }

  /** Did a rollout cause problems — ranked by fallout, or one workload (target). */
  deployImpact(p: DeployImpactParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("deploy_impact", [
      ["target", p.target],
      ["since", p.since],
    ], p.limit));
  }

  /** What do recent failures share — the suspected common cause (shared node / owning workload). */
  commonCause(p: CommonCauseParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("common_cause", [
      ["namespace", p.namespace],
      ["since", p.since],
    ], p.limit));
  }

  /** Transitive blast radius — the workloads & services affected if `resource` changes/dies. */
  blast(p: BlastParams): Promise<AskResult> {
    return this.typedQuery(compose("blast_radius", [
      ["resource", p.resource],
    ], p.limit));
  }

  /** Single points of failure — most-depended-on resources of a kind, ranked by fan-in. */
  spof(p: SpofParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("spof", [
      ["kind", p.kind],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** Orphans — unused / dangling resources of a kind (zero fan-in), the inverse of spof. */
  orphans(p: OrphansParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("orphans", [
      ["kind", p.kind],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** Observability blind spots — workloads with no Datadog presence, services with no monitor, or workloads shipping no metrics. */
  coverage(p: CoverageParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("coverage", [
      ["kind", p.kind],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** Network segmentation — default-allow namespaces (default), a target's policies, or its east-west reach. */
  netpol(p: NetpolParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("netpol", [
      ["mode", p.mode],
      ["target", p.target],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** Scheduling priority / preemption — workloads with no priority class (default), the priority-class ladder, or a target's own class. */
  priority(p: PriorityParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("priority", [
      ["kind", p.kind],
      ["target", p.target],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** Persistent storage — a workload/pod's PVC→PV→StorageClass footprint (default), orphaned PVs, unclaimed PVCs, or what a storageclass backs. */
  storage(p: StorageParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("storage", [
      ["mode", p.mode],
      ["workload", p.workload],
      ["class", p.class],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** PodDisruptionBudget coverage — workloads with no PDB, or the PDB(s)/pods for one workload/PDB. */
  pdb(p: PdbParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("pdb", [["target", p.target]], p.limit));
  }

  /** Autoscaler coverage & HPA targets — workloads with no HPA (default), the autoscaled ones, or a workload/HPA's SCALES relation. */
  scaling(p: ScalingParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("scaling", [
      ["mode", p.mode],
      ["target", p.target],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** GitOps — drifted ArgoCD apps (default), unmanaged workloads, or a workload's owning app + repo. */
  gitops(p: GitopsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("gitops", [
      ["subject", p.subject],
      ["resource", p.resource],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /** Terraform code-to-state-to-cloud provenance and linkage coverage. */
  iac(p: IacParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("iac", [
      ["resource", p.resource],
      ["status", p.status],
      ["freshness", p.freshness],
    ], p.limit, p.offset));
  }

  /** Compare supported last-applied Terraform state with fresh observed cloud properties. */
  iacDrift(p: IacDriftParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("iac_drift", [
      ["resource", p.resource],
      ["status", p.status],
      ["freshness", p.freshness],
    ], p.limit, p.offset));
  }

  /**
   * RBAC reach + over-privilege — the roles (and verbs/resources) a subject can assume, the
   * subjects bound to a role, or (mode="privileged") the ranked over-privileged serviceaccounts.
   */
  access(p: AccessParams): Promise<AskResult> {
    return this.typedQuery(compose("access", [
      ["resource", p.resource],
      ["mode", p.mode],
    ], p.limit));
  }

  /** Canonical evidence paths from an internet edge to a workload, with explicit gaps and controls. */
  async exposure(p: ExposureParams): Promise<AskResultFor<"exposure">> {
    if (p.cursor !== undefined && !nonEmptyString(p.cursor)) {
      throw new TypeError("exposure cursor must be a non-empty opaque string");
    }
    const result = await this.typedQuery(compose("exposure", [
      ...exposureSelectorConditions(p.resource),
      ["cursor", p.cursor],
    ], p.limit));
    if (!isCanonicalExposureResult(result)) {
      throw new GraphAnswerError(
        "unsupported_server",
        "Canonical exposure results require Graph API query-language 1.11 or newer; upgrade the server.",
      );
    }
    return result;
  }

  /** Co-location / noisy neighbors — the workloads sharing a node with the resource. */
  tenancy(p: TenancyParams): Promise<AskResult> {
    return this.typedQuery(compose("tenancy", [
      ["resource", p.resource],
    ], p.limit));
  }

  /** Config coupling — the workloads sharing a configmap with the resource (config blast siblings). */
  sharedConfig(p: SharedConfigParams): Promise<AskResult> {
    return this.typedQuery(compose("sharedconfig", [
      ["resource", p.resource],
    ], p.limit));
  }

  /** How two resources are connected — the shortest structural path between them. */
  path(p: PathParams): Promise<AskResult> {
    return this.typedQuery(compose("path", [
      ...selectorConditions("from", p.from),
      ...selectorConditions("to", p.to),
      ["scope", p.scope],
    ]));
  }

  /** Trace how an incident propagated — root trigger → affected resources over time. */
  cascade(p: CascadeParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("cascade", [
      ["target", p.target],
      ["id", p.id],
    ]));
  }

  /** Which Datadog monitors & SLOs would fire if `resource` is impacted. */
  alertImpact(p: AlertImpactParams): Promise<AskResult> {
    return this.typedQuery(compose("alert_impact", [["resource", p.resource]]));
  }

  /** From a Datadog monitor/alert to the service → workload → node it watches. */
  monitor(p: MonitorParams): Promise<AskResult> {
    return this.typedQuery(compose("monitor", [["target", p.target]]));
  }

  /** Which services use a datastore — one DB (target) or the ranked top datastores. */
  datastore(p: DataStoreParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("datastore", [["target", p.target], ["source", p.source]], p.limit));
  }

  /** Kafka/stream tracing — one topic's producers/consumers, or the ranked busiest streams. */
  flow(p: FlowParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("flow", [["target", p.target], ["source", p.source]], p.limit));
  }

  /** External-dependency blast radius — one host's dependents, or the ranked external deps. */
  externalDep(p: ExternalDepParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("external_dep", [["target", p.target], ["source", p.source]], p.limit));
  }

  /** SLO health — one named SLO's status, or the ranked breaching/at-risk SLOs (worst-first). */
  slo(p: SloParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("slo", [["target", p.target]], p.limit));
  }

  /** Datadog monitors firing right now (Alert/Warn) → the infra behind them; scope with target. */
  alerts(p: AlertsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("alerts", [["target", p.target]], p.limit));
  }

  /** The APM service call graph — one service's callers/callees, or the ranked most-called. */
  calls(p: CallsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("calls", [["target", p.target], ["source", p.source]], p.limit));
  }

  /** Noisiest monitors by trigger/recover churn (flapping vs stuck), cluster-wide or scoped to a service/namespace. */
  alertNoise(p: AlertNoiseParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("alert_noise", [["target", p.target], ["kind", p.kind], ["since", p.since]], p.limit));
  }

  /** A service's full transitive downstream footprint (services + infra leaves), or the ranked footprints. */
  serviceTree(p: ServiceTreeParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("servicetree", [["target", p.target], ["source", p.source]], p.limit));
  }

  /** Why a Datadog alert is firing — the firing workload + its recent K8s changes (the suspect). */
  alertCause(p: AlertCauseParams): Promise<AskResult> {
    return this.typedQuery(compose("alert_cause", [["target", p.target], ["since", p.since]], p.limit));
  }

  /** Grafana/Victoria alert-rule coverage — gaps (default), the rule inventory, or one workload's rules. */
  alertRules(p: AlertRulesParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("alertrules", [
      ["subject", p.subject],
      ["namespace", p.namespace],
      ["target", p.target],
    ], p.limit));
  }

  /** Container inventory by image — who runs an image (CVE blast radius), a workload's images, a hygiene scan, or the ranked top images. */
  image(p: ImageParams = {}): Promise<AskResult> {
    if (p.digest && (p.target || p.workload || p.kind || p.namespace)) {
      throw new TypeError("image digest cannot be combined with target, workload, kind, or namespace");
    }
    return this.typedQuery(compose("image", [
      ["digest", p.digest],
      ["target", p.target],
      ["workload", p.workload],
      ["kind", p.kind],
      ["namespace", p.namespace],
    ], p.limit));
  }

  /**
   * Cross-layer C4 / mermaid diagram subgraph — the service's neighborhood as a typed {nodes,edges}
   * graph (in the result's `nodes` / `edges`), scoped by C4 `level`. Pair with `toMermaid()` to render.
   */
  topology(p: TopologyParams): Promise<AskResult> {
    return this.typedQuery(compose("topology", [
      ["service", p.service],
      ["level", p.level],
      ["source", p.source],
      ["endpoint", p.endpoint],
      ["dependency", p.dependency],
    ]));
  }

  // Shared transport used by query/ask and (Task 4) the typed methods.
  protected async post(
    path: string,
    body: Record<string, unknown>,
    workflow: "query" | "ask" | "typed-query",
    step?: string,
  ): Promise<AskResult> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-anyshift-client": "graph-sdk-typescript",
      "x-anyshift-client-version": GRAPH_SDK_VERSION,
      "x-anyshift-invocation-id": this.invocationId ?? generateInvocationId(),
      "x-anyshift-graph-workflow": workflow,
    };
    if (step) headers["x-anyshift-graph-step"] = step;
    if (this.token) headers["authorization"] = `Bearer ${this.token}`;

    let res: { ok: boolean; status: number; text(): Promise<string> };
    try {
      res = await this.fetchImpl(this.baseUrl + path, { method: "POST", headers, body: JSON.stringify(body) });
    } catch (e) {
      throw new GraphAnswerError("network", `request to ${path} failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    const text = await res.text();
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      /* non-JSON body; handled below */
    }

    if (!res.ok) {
      // Envelope is { error: { code, message } }; tolerate a bare string too.
      const env = json?.error;
      const message =
        (env && typeof env === "object" && env.message) ||
        (typeof env === "string" ? env : "") ||
        text ||
        `HTTP ${res.status}`;
      const code = (env && typeof env === "object" && env.code) ||
        (res.status === 401 ? "unauthorized" : res.status === 400 ? "bad_request" : "internal");
      if (res.status === 401) throw new AuthError(message, res.status);
      if (res.status === 400) throw new BadQueryError(message, res.status);
      throw new GraphAnswerError(code, message, res.status);
    }

    return json as AskResult;
  }
}
