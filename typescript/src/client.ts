import {
  GraphAnswerError,
  AuthError,
  BadQueryError,
  type ResourceSelectionCandidate,
  type TimeoutSource,
} from "./errors.js";
import type { AskResult, AskResultFor, OperationalProvider } from "./types.js";
import { GRAPH_SDK_VERSION } from "./version.js";

// Minimal shape we need from fetch — keeps real `fetch` and test stubs both valid
// without depending on DOM/undici Response types.
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string }
) => Promise<{
  ok: boolean;
  status: number;
  headers?: { get(name: string): string | null };
  text(): Promise<string>;
}>;

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
  /** Inclusive RFC3339 lower bound. Must be paired with until and cannot be combined with since. */
  from?: string;
  /** Exclusive RFC3339 upper bound. Must be paired with from and cannot be combined with since. */
  until?: string;
  /** Exact stable graph resource id. */
  targetId?: string;
  /** Exact resource label used with target. */
  targetType?: string;
  /** Exact cluster name used with target. */
  cluster?: string;
  /** Skip exact full-window counts for lower-latency page reads. */
  stats?: "exact" | "none";
  /** Opaque cursor returned by the previous bounded page. */
  cursor?: string;
  limit?: number;
  offset?: number;
}
export interface CloudEventsParams {
  /** Cloud provider. */
  provider?: "aws" | "azure" | "gcp" | "cloudflare";
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
  /** Exact statistics are the legacy default; none skips the full-window count for bounded browsing. */
  stats?: "exact" | "none";
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
export interface CorrelationsParams {
  /** A resource/app involved in the correlation group (resolves to its latest group). */
  target?: string;
  /** A correlation id, if known. */
  id?: string;
  /** Optional event type filter. */
  type?: string;
  /** Time window that bounds target resolution (for example `"2h"`). */
  since?: Since;
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
export interface OperationalParams {
  /** Restrict results to one operational provider. */
  provider?: OperationalProvider;
  /** Canonical graph service identity. Mutually exclusive with providerServiceId. */
  service?: ResourceSelector;
  /** Provider-native service identity escape hatch. Mutually exclusive with service. */
  providerServiceId?: string;
  /** Absolute RFC3339 lower bound. */
  from?: string;
  /** Absolute RFC3339 upper bound. */
  to?: string;
  /** Point in time. Alerts/incidents accept only now; on-call also accepts RFC3339. */
  at?: string;
  /** Opaque keyset cursor from the previous page. */
  cursor?: string;
  /** Page size, from 1 to 100. */
  limit?: number;
}
export interface AlertsParams extends OperationalParams {
  /** A service/workload to scope to; omit for all firing monitors. */
  target?: string;
  status?: "firing" | "recovered" | "suppressed" | "unknown" | "all";
  severity?: "critical" | "warning" | "info" | "unknown";
  since?: Since;
}
export interface IncidentsParams extends OperationalParams {
  status?: "active" | "open" | "acknowledged" | "resolved" | "unknown" | "all";
  since?: Since;
  /** Exact responder source identity or canonical person identity. */
  responder?: string;
  /** Provider-native urgency value. */
  urgency?: string;
}
export interface OnCallParams extends OperationalParams {
  status?: "scheduled" | "active" | "ended" | "all";
  /** Exact source identity or canonical person identity. */
  person?: string;
  /** Exact provider schedule identity. */
  schedule?: string;
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
  /** Workload name. Mutually exclusive with targetId. */
  target?: string;
  /** Exact stable workload graph id. Mutually exclusive with target. */
  targetId?: string;
  targetType?: string;
  namespace?: string;
  cluster?: string;
  /** Alert or monitor name to report and optionally scope current monitor evidence. */
  alert?: string;
  /** Inclusive RFC3339 alert start. */
  from: string;
  /** Exclusive RFC3339 alert end. */
  to: string;
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

type OperationalWithSince = OperationalParams & { since?: Since };

function requireNonEmpty(field: string, value: string | undefined): void {
  if (value !== undefined && (typeof value !== "string" || value.trim() === "")) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function validateOperationalTime(field: "from" | "to" | "until" | "at", value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be RFC3339 or now`);
  }
  if (field === "at" && value.toLowerCase() === "now") return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) throw new TypeError(`${field} must be RFC3339 or now`);
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , , offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const offsetHour = offsetHourText === undefined ? 0 : Number(offsetHourText);
  const offsetMinute = offsetMinuteText === undefined ? 0 : Number(offsetMinuteText);
  const daysInMonth = month >= 1 && month <= 12 ? new Date(Date.UTC(year, month, 0)).getUTCDate() : 0;
  const parsed = Date.parse(value);
  if (day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59
    || offsetHour > 23 || offsetMinute > 59 || !Number.isFinite(parsed)) {
    throw new TypeError(`${field} must be RFC3339 or now`);
  }
  return parsed;
}

function compareRfc3339(left: string, right: string): number {
  const parts = (value: string) => {
    const fraction = /\.(\d{1,9})(?=Z|[+-]\d{2}:\d{2}$)/.exec(value)?.[1] ?? "";
    const wholeSecond = value.replace(/\.\d{1,9}(?=Z|[+-]\d{2}:\d{2}$)/, "");
    return {
      epochSecond: Math.floor(Date.parse(wholeSecond) / 1_000),
      nanosecond: Number(fraction.padEnd(9, "0")),
    };
  };
  const a = parts(left);
  const b = parts(right);
  if (a.epochSecond !== b.epochSecond) return a.epochSecond < b.epochSecond ? -1 : 1;
  if (a.nanosecond === b.nanosecond) return 0;
  return a.nanosecond < b.nanosecond ? -1 : 1;
}

function validateEventWindow(p: EventsParams): void {
  for (const [field, value] of [
    ["target", p.target], ["targetId", p.targetId], ["targetType", p.targetType],
    ["namespace", p.namespace], ["cluster", p.cluster], ["cursor", p.cursor],
  ] as const) requireNonEmpty(field, value);
  const from = validateOperationalTime("from", p.from);
  const until = validateOperationalTime("until", p.until);
  if ((from === undefined) !== (until === undefined)) throw new TypeError("from and until must be provided together");
  if (p.since !== undefined && p.from !== undefined) throw new TypeError("since cannot be combined with from and until");
  if (from !== undefined && until !== undefined && compareRfc3339(p.from!, p.until!) >= 0) {
    throw new TypeError("from must be earlier than until");
  }
  if (p.target !== undefined && p.targetId !== undefined) throw new TypeError("target and targetId cannot be combined");
  if (p.targetId !== undefined && (p.targetType !== undefined || p.namespace !== undefined || p.cluster !== undefined)) {
    throw new TypeError("targetId cannot be combined with targetType, namespace, or cluster");
  }
  if ((p.targetType !== undefined || p.cluster !== undefined) && p.target === undefined) {
    throw new TypeError("targetType and cluster require target");
  }
  if (p.offset !== undefined && (p.cursor !== undefined || p.from !== undefined || p.until !== undefined)) {
    throw new TypeError("offset cannot be combined with a bounded event window or cursor");
  }
}

function operationalServiceConditions(p: OperationalParams): Array<[string, string]> {
  if (p.service !== undefined && p.providerServiceId !== undefined) {
    throw new TypeError("service and providerServiceId cannot be combined");
  }
  requireNonEmpty("providerServiceId", p.providerServiceId);
  if (p.providerServiceId !== undefined) return [["provider_service_id", p.providerServiceId]];
  if (p.service === undefined) return [];
  if (typeof p.service === "string") {
    requireNonEmpty("service", p.service);
    return [["service", p.service]];
  }
  if (p.service === null || typeof p.service !== "object") {
    throw new TypeError("service must be a string, stable id, or named selector");
  }
  if ("id" in p.service) {
    const candidate = p.service as ResourceSelector & Record<string, unknown>;
    if (candidate.name !== undefined || candidate.type !== undefined || candidate.namespace !== undefined
      || candidate.cluster !== undefined) {
      throw new TypeError("service id cannot be combined with name or qualifiers");
    }
    if (typeof candidate.id !== "string" || candidate.id.trim() === "") {
      throw new TypeError("service id must be a non-empty string");
    }
    return [["service_id", candidate.id]];
  }
  const candidate = p.service as { name?: unknown; type?: unknown; namespace?: unknown; cluster?: unknown };
  if (typeof candidate.name !== "string" || candidate.name.trim() === "") {
    throw new TypeError("service name must be a non-empty string");
  }
  if (typeof candidate.type !== "string" || candidate.type.trim() === "") {
    throw new TypeError("service type must be a non-empty string");
  }
  for (const field of ["namespace", "cluster"] as const) {
    const value = candidate[field];
    if (value !== undefined && (typeof value !== "string" || value.trim() === "")) {
      throw new TypeError(`service ${field} must be a non-empty string when provided`);
    }
  }
  return [
    ["service", candidate.name],
    ["service_type", candidate.type],
    ["service_namespace", candidate.namespace ?? ""],
    ["service_cluster", candidate.cluster ?? ""],
  ].filter(([, value]) => value !== "") as Array<[string, string]>;
}

function validateOperationalParams(
  p: OperationalWithSince,
  options: { historicalAt: boolean; supportsSince: boolean },
): Array<[string, string]> {
  if (p.limit !== undefined && (!Number.isInteger(p.limit) || p.limit < 1 || p.limit > 100)) {
    throw new TypeError("limit must be an integer from 1 to 100");
  }
  requireNonEmpty("cursor", p.cursor);
  const from = validateOperationalTime("from", p.from);
  const to = validateOperationalTime("to", p.to);
  validateOperationalTime("at", p.at);
  if (p.at !== undefined && (p.from !== undefined || p.to !== undefined)) {
    throw new TypeError("at cannot be combined with from or to");
  }
  if (!options.historicalAt && p.at !== undefined && p.at.toLowerCase() !== "now") {
    throw new TypeError("at supports only now; use since, from, or to for stored history");
  }
  if (!options.supportsSince && p.since !== undefined) {
    throw new TypeError("since is not supported for on-call queries");
  }
  if (p.since !== undefined && p.from !== undefined) {
    throw new TypeError("since cannot be combined with from");
  }
  if (from !== undefined && to !== undefined && compareRfc3339(p.from!, p.to!) >= 0) {
    throw new TypeError("from must be earlier than to");
  }
  return operationalServiceConditions(p);
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
    validateEventWindow(p);
    return this.typedQuery(compose("events", [
      ["type", p.type],
      ["target", p.target],
      ["target_id", p.targetId],
      ["target_type", p.targetType],
      ["namespace", p.namespace],
      ["cluster", p.cluster],
      ["noise", p.noise === "all" ? "all" : undefined],
      ["stats", p.stats],
      ["since", p.since],
      ["from", p.from],
      ["until", p.until],
      ["cursor", p.cursor],
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
      ["stats", p.stats],
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

  /** Reconstruct a correlated Anyshift event group around a target or correlation id. */
  correlations(p: CorrelationsParams = {}): Promise<AskResult> {
    return this.typedQuery(compose("correlations", [
      ["target", p.target],
      ["id", p.id],
      ["type", p.type],
      ["since", p.since],
    ]));
  }

  /**
   * @deprecated Prefer {@link GraphAnswer.correlations}. Still queries the legacy
   * `incidents` target and returns the `incident` intent for v1 compatibility.
   */
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

  /** Provider-neutral operational alerts; legacy Datadog fields remain additive during v1. */
  alerts(p: AlertsParams = {}): Promise<AskResult> {
    const service = validateOperationalParams(p, { historicalAt: false, supportsSince: true });
    return this.typedQuery(compose("alerts", [
      ["target", p.target],
      ["provider", p.provider],
      ["status", p.status],
      ["severity", p.severity],
      ...service,
      ["since", p.since],
      ["from", p.from],
      ["to", p.to],
      ["at", p.at],
      ["cursor", p.cursor],
    ], p.limit));
  }

  /** Provider-neutral response incidents. In API v1 this targets response_incidents. */
  incidents(p: IncidentsParams = {}): Promise<AskResult> {
    const service = validateOperationalParams(p, { historicalAt: false, supportsSince: true });
    requireNonEmpty("responder", p.responder);
    requireNonEmpty("urgency", p.urgency);
    return this.typedQuery(compose("response_incidents", [
      ["provider", p.provider],
      ["status", p.status],
      ...service,
      ["since", p.since],
      ["from", p.from],
      ["to", p.to],
      ["at", p.at],
      ["cursor", p.cursor],
      ["responder", p.responder],
      ["urgency", p.urgency],
    ], p.limit));
  }

  /** Effective on-call responsibility at now, a point in time, or over a bounded window. */
  onCall(p: OnCallParams = {}): Promise<AskResult> {
    const service = validateOperationalParams(p, { historicalAt: true, supportsSince: false });
    requireNonEmpty("person", p.person);
    requireNonEmpty("schedule", p.schedule);
    return this.typedQuery(compose("oncall", [
      ["provider", p.provider],
      ["status", p.status],
      ...service,
      ["from", p.from],
      ["to", p.to],
      ["at", p.at],
      ["cursor", p.cursor],
      ["person", p.person],
      ["schedule", p.schedule],
    ], p.limit));
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

  /** Topology-bound change candidates inside one explicit alert interval. */
  alertCause(p: AlertCauseParams): Promise<AskResult> {
    requireNonEmpty("target", p.target);
    requireNonEmpty("targetId", p.targetId);
    requireNonEmpty("targetType", p.targetType);
    requireNonEmpty("namespace", p.namespace);
    requireNonEmpty("cluster", p.cluster);
    requireNonEmpty("alert", p.alert);
    if (Boolean(p.target) === Boolean(p.targetId)) {
      throw new TypeError("alertCause requires exactly one of target or targetId");
    }
    if (p.targetId && (p.targetType || p.namespace || p.cluster)) {
      throw new TypeError("alertCause targetId cannot be combined with targetType, namespace, or cluster");
    }
    const from = validateOperationalTime("from", p.from);
    const to = validateOperationalTime("to", p.to);
    if (from === undefined || to === undefined || compareRfc3339(p.from, p.to) >= 0) {
      throw new TypeError("alertCause from must be earlier than to");
    }
    return this.typedQuery(compose("alert_cause", [
      ["target", p.target], ["target_id", p.targetId], ["target_type", p.targetType],
      ["namespace", p.namespace], ["cluster", p.cluster], ["alert", p.alert],
      ["from", p.from], ["to", p.to],
    ], p.limit));
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

    let res: Awaited<ReturnType<FetchLike>>;
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
      const code = res.status === 504
        ? "timeout"
        : (env && typeof env === "object" && env.code) ||
          (res.status === 401 ? "unauthorized" : res.status === 400 ? "bad_request" : "internal");
      const requestId = res.headers?.get("x-request-id") ?? undefined;
      if (res.status === 401) throw new AuthError(message, res.status);
      if (res.status === 400) {
        const selectionCode = env?.selectionCode === "ambiguous_resource"
          ? "ambiguous_resource" as const
          : undefined;
        const candidates = Array.isArray(env?.candidates)
          ? env.candidates.filter((candidate: unknown): candidate is ResourceSelectionCandidate => {
              if (!candidate || typeof candidate !== "object") return false;
              const value = candidate as Record<string, unknown>;
              const nullableString = (field: string) =>
                value[field] === null || typeof value[field] === "string";
              return typeof value.id === "string" &&
                typeof value.name === "string" &&
                nullableString("anyshiftID") &&
                nullableString("type") &&
                nullableString("namespace") &&
                nullableString("cluster");
            })
          : [];
        throw new BadQueryError(message, res.status, selectionCode, candidates);
      }
      const timeoutSource: TimeoutSource | undefined = code === "timeout"
        ? (env?.timeoutSource === "statement" || env?.timeoutSource === "request"
            ? env.timeoutSource
            : "gateway")
        : undefined;
      throw new GraphAnswerError(code, message, res.status, { timeoutSource, requestId });
    }

    return json as AskResult;
  }
}
