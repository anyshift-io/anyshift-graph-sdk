import type { components } from "./openapi.generated.js";

type Schemas = components["schemas"];

export type Page = Schemas["Page"];
export type GraphNode = Schemas["GraphNode"];
export type GraphEdge = Schemas["GraphEdge"];
export type TopologyResult = Schemas["TopologyResult"];
export type C4Level = TopologyResult["level"];
export type ResolveResult = Schemas["ResolveResult"];
export type ResolveCandidate = ResolveResult["candidates"][number];
export type CloudEventsResult = Schemas["CloudEventsResult"];
export type CloudEventItem = CloudEventsResult["items"][number];
export type CloudResourcesResult = Schemas["CloudResourcesResult"];
export type CloudResourceItem = CloudResourcesResult["items"][number];
export type DeliveryEventsResult = Schemas["DeliveryEventsResult"];
export type DeliveryEventItem = DeliveryEventsResult["items"][number];
export type DeliveryStage = DeliveryEventItem["stage"];
export type ProvenanceResult = Schemas["ProvenanceResult"];
export type ProvenanceItem = ProvenanceResult["items"][number];
export type OwnershipResult = Schemas["OwnershipResult"];
export type OwnershipItem = OwnershipResult["items"][number];
export type GraphCoverageResult = Schemas["GraphCoverageResult"];
export type GraphCoverageSource = GraphCoverageResult["sources"][number]["source"];
export type ImpactResult = Schemas["ImpactResult"];
export type ImpactItem = ImpactResult["items"][number];
export type ImpactStep = ImpactItem["path"][number];
export type ExposureResult = Schemas["ExposureResult"];
export type ExposureService = ExposureResult["services"][number];
export type ExposureIngressRef = ExposureResult["ingresses"][number];
export type ExposurePerspective = ExposureResult["perspective"];
export type ExposureVerdict = ExposureResult["verdict"];
export type ExposureResource = NonNullable<ExposureResult["subject"]>;
export type ExposurePath = ExposureResult["paths"][number];
export type ExposureHop = ExposurePath["hops"][number];
export type ExposureControl = ExposurePath["controls"][number];
export type ExposureGap = ExposurePath["gaps"][number];
export type ExposureEvidence = ExposureHop["evidence"];
/** Managed runtime identity for an exposure path (EKS via HOSTS). Null when unknown. */
export type ExposurePlatform = NonNullable<ExposurePath["platform"]>;
export type CorrelationsResult = Schemas["CorrelationsResult"];
export type IncidentResult = Schemas["IncidentResult"];
export type AlertsResult = Schemas["AlertsResult"];
export type AlertItem = AlertsResult["items"][number];
export type ResponseIncidentsResult = Schemas["ResponseIncidentsResult"];
export type ResponseIncidentItem = ResponseIncidentsResult["items"][number];
export type OnCallResult = Schemas["OnCallResult"];
export type OnCallWindowItem = OnCallResult["items"][number];
export type OperationalProvider = ResponseIncidentsResult["providers"][number]["provider"];
export type ProviderCoverage = ResponseIncidentsResult["providers"][number];
export type QueryWarning = ResponseIncidentsResult["warnings"][number];
export type GraphResourceRef = NonNullable<ResponseIncidentItem["service"]>;
export type IdentityRef = ResponseIncidentItem["responders"][number];
export type IdentityCandidate = IdentityRef["candidates"][number];

/** Every successful Graph API response, discriminated by its exact intent payload. */
export type AskResult = Schemas["AskResult"];
export type GraphIntent = AskResult["intent"];

/** Select the exact response shape returned for one Graph API intent. */
export type AskResultFor<I extends GraphIntent> = Extract<AskResult, { intent: I }>;
