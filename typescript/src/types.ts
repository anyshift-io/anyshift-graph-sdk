import type { components } from "./openapi.generated.js";

type Schemas = components["schemas"];

export type Page = Schemas["Page"];
export type GraphNode = Schemas["GraphNode"];
export type GraphEdge = Schemas["GraphEdge"];
export type TopologyResult = Schemas["TopologyResult"];
export type C4Level = TopologyResult["level"];
export type ResolveResult = Schemas["ResolveResult"];
export type ResolveCandidate = ResolveResult["candidates"][number];

/** Every successful Graph API response, discriminated by its exact intent payload. */
export type AskResult = Schemas["AskResult"];
export type GraphIntent = AskResult["intent"];

/** Select the exact response shape returned for one Graph API intent. */
export type AskResultFor<I extends GraphIntent> = Extract<AskResult, { intent: I }>;
