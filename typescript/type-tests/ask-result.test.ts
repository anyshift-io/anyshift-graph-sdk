import type {
  ApmSource,
  AlertItem,
  AlertsResult,
  AskResult,
  AskResultFor,
  CloudEventItem,
  CloudResourceItem,
  ExposureControl,
  ExposureEvidence,
  ExposureGap,
  ExposureHop,
  ExposureIngressRef,
  ExposurePath,
  ExposurePlatform,
  ExposurePerspective,
  ExposureResource,
  ExposureResult,
  ExposureService,
  ExposureVerdict,
  GraphEdge,
  GraphIntent,
  OnCallResult,
  OnCallWindowItem,
  OperationalProvider,
  ProviderCoverage,
  ResourceSelector,
  ResponseIncidentItem,
  ResponseIncidentsResult,
  TopologySource,
} from "../src/index.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

type ExpectedIntent =
  | "resolve" | "resource" | "connections" | "inventory" | "events" | "cloudevents" | "cloudresources" | "deliveryevents" | "provenance" | "ownership" | "graphcoverage" | "impact" | "hotspots" | "correlations" | "incident" | "responseincidents" | "oncall" | "failures"
  | "deployments" | "audit" | "nodes" | "deployimpact" | "commoncause" | "blast"
  | "spof" | "path" | "cascade" | "alertimpact" | "monitor" | "datastore" | "flow"
  | "externaldep" | "alerts" | "alertnoise" | "calls" | "servicetree" | "alertcause"
  | "access" | "exposure" | "orphans" | "coverage" | "slo" | "tenancy"
  | "sharedconfig" | "alertrules" | "iac" | "iacdrift" | "gitops" | "image" | "netpol" | "storage"
  | "pdb" | "scaling" | "topology" | "priority";

type _AllIntentsAreExported = Assert<Equal<GraphIntent, ExpectedIntent>>;

declare const result: AskResult;

if (result.intent === "inventory") {
  const total: number | undefined = result.inventory?.total;
  void total;
  // @ts-expect-error discriminating inventory must exclude event payloads
  result.events;
}

if (result.intent === "events") {
  const total: number | undefined = result.events?.total;
  void total;
  // @ts-expect-error discriminating events must exclude inventory payloads
  result.inventory;
}

declare const inventory: AskResultFor<"inventory">;
const inventoryIntent: "inventory" = inventory.intent;
const inventoryTotal: number | undefined = inventory.inventory?.total;
void inventoryIntent;
void inventoryTotal;

declare const resolved: AskResultFor<"resolve">;
const firstCandidateName: string | undefined = resolved.resolve?.candidates[0]?.name;
void firstCandidateName;

declare const imageResult: AskResultFor<"image">;
if (imageResult.image?.mode === "bydigest" && imageResult.image.byDigest) {
  const runtimeImageId: string | undefined = imageResult.image.byDigest.matches[0]?.imageID;
  const workloadIdentity: string | null | undefined = imageResult.image.byDigest.matches[0]?.workloadHashedID;
  const clusterName: string | null | undefined = imageResult.image.byDigest.matches[0]?.clusterName;
  const clusterId: string | null | undefined = imageResult.image.byDigest.matches[0]?.clusterID;
  const clusterIdentity: string | null | undefined = imageResult.image.byDigest.matches[0]?.clusterHashedID;
  void runtimeImageId;
  void workloadIdentity;
  void clusterName;
  void clusterId;
  void clusterIdentity;
}

declare const exposureResult: AskResultFor<"exposure">;
const canonicalExposure: ExposureResult = exposureResult.exposure;
const exposurePerspective: ExposurePerspective = canonicalExposure.perspective;
const exposureVerdict: ExposureVerdict = canonicalExposure.verdict;
const exposureService: ExposureService | undefined = canonicalExposure.services[0];
const exposureIngress: ExposureIngressRef | undefined = canonicalExposure.ingresses[0];
const exposureResource: ExposureResource | null = canonicalExposure.subject;
const exposurePath: ExposurePath | undefined = canonicalExposure.paths[0];
declare const exposureHop: ExposureHop;
declare const exposureControl: ExposureControl;
declare const exposureGap: ExposureGap;
const exposureEvidence: ExposureEvidence = exposureHop.evidence;
const exposurePlatform: ExposurePlatform | null = exposurePath?.platform ?? null;
type PublicSdk057ExposureResult = {
  direction: "ingress" | "workload";
  exposed: boolean;
  services: Array<{ service: string; namespace: string | null; pods: number; workloads: string[] }>;
  ingresses: Array<{ ingress: string; namespace: string | null; via: string | null }>;
};
// Query-language 1.11 is additive for the four fields consumed by the public 0.5.7 SDK.
const publicSdk057CompatibleExposure: PublicSdk057ExposureResult = canonicalExposure;
void exposurePerspective;
void exposureVerdict;
void exposureService;
void exposureIngress;
void exposureResource;
void exposurePath;
void exposureControl;
void exposureGap;
void exposureEvidence;
void exposurePlatform;
void publicSdk057CompatibleExposure;

declare const cloudResource: CloudResourceItem;
const provenanceStatus: "managed" | "configured" | "unknown" = cloudResource.provenance.status;
void provenanceStatus;

declare const cloudEvent: CloudEventItem;
const providerOperationId: string | null = cloudEvent.correlation.providerOperationId;
const anyshiftCorrelationId: string | null = cloudEvent.correlation.id;
void providerOperationId;
void anyshiftCorrelationId;

declare const cloudEventsResult: AskResultFor<"cloudevents">;
const cloudEventTotal: number | null | undefined = cloudEventsResult.cloudEvents?.total;
const cloudEventStatisticsMode: "exact" | "none" | undefined = cloudEventsResult.cloudEvents?.statistics.mode;
const cloudEventStatisticsExact: boolean | undefined = cloudEventsResult.cloudEvents?.statistics.exact;
void cloudEventTotal;
void cloudEventStatisticsMode;
void cloudEventStatisticsExact;

declare const correlationsResult: AskResultFor<"correlations">;
const correlationsIntent: "correlations" = correlationsResult.intent;
const correlationsId: string | null | undefined = correlationsResult.correlations?.correlationId;
void correlationsIntent;
void correlationsId;
// @ts-expect-error discriminating correlations must exclude the legacy incident payload
correlationsResult.incident;

declare const incidentResult: AskResultFor<"incident">;
const incidentIntent: "incident" = incidentResult.intent;
const incidentId: string | null | undefined = incidentResult.incident?.correlationId;
void incidentIntent;
void incidentId;

declare const responseIncidents: AskResultFor<"responseincidents">;
const responseIncidentsIntent: "responseincidents" = responseIncidents.intent;
const responseIncidentsPayload: ResponseIncidentsResult | null = responseIncidents.incidents;
const responseIncident: ResponseIncidentItem | undefined = responseIncidentsPayload?.items[0];
const responseProvider: OperationalProvider | undefined = responseIncident?.provider;
const responseCoverage: ProviderCoverage | undefined = responseIncidentsPayload?.providers[0];
void responseIncidentsIntent;
void responseIncident;
void responseProvider;
void responseCoverage;
// @ts-expect-error response incidents are distinct from Anyshift correlation payloads
responseIncidents.correlations;

declare const onCall: AskResultFor<"oncall">;
const onCallIntent: "oncall" = onCall.intent;
const onCallPayload: OnCallResult | null = onCall.onCall;
const onCallWindow: OnCallWindowItem | undefined = onCallPayload?.items[0];
void onCallIntent;
void onCallWindow;
// @ts-expect-error on-call results are distinct from response incidents
onCall.incidents;

declare const alerts: AskResultFor<"alerts">;
const alertsPayload: AlertsResult | null = alerts.alerts;
const alertItem: AlertItem | undefined = alertsPayload?.items[0];
void alertItem;

declare const edge: GraphEdge;
const edgeSemantic:
  | "dependency" | "ownership" | "identity" | "connectivity" | "context" | "plumbing" | "unknown" =
    edge.semantic;
const impactEligible: boolean = edge.impact;
void edgeSemantic;
void impactEligible;

const typedSelector: ResourceSelector = {
  name: "checkout-api",
  type: "K8S_DEPLOYMENT",
  namespace: "shop",
};
const stableSelector: ResourceSelector = { id: "resource-hash" };
// @ts-expect-error Name-based selectors must include a resource type to be deterministic.
const ambiguousSelector: ResourceSelector = { name: "checkout-api" };
// @ts-expect-error Stable ids cannot be combined with the name selector mode.
const mixedSelector: ResourceSelector = { id: "resource-hash", name: "checkout-api", type: "K8S_DEPLOYMENT" };
// @ts-expect-error Stable ids cannot carry name qualifiers.
const qualifiedStableSelector: ResourceSelector = { id: "resource-hash", namespace: "shop" };
void typedSelector;
void stableSelector;
void ambiguousSelector;
void mixedSelector;
void qualifiedStableSelector;
const tempoSource: ApmSource = "tempo";
const dynatraceSource: ApmSource = "dynatrace";
const configurationSource: TopologySource = "configuration";
void tempoSource;
void dynatraceSource;
void configurationSource;
const configurationEvidenceSource: "configuration" | undefined =
  edge.evidence?.source;
void configurationEvidenceSource;
