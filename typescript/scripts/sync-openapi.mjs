import { writeFile } from "node:fs/promises";

const source = process.env.GRAPH_API_OPENAPI_URL ?? "https://graph.anyshift.io/v1/openapi.json";
const target = new URL("../../openapi/graph-api.v1.json", import.meta.url);

const response = await fetch(source);
if (!response.ok) {
  throw new Error(`failed to fetch ${source}: ${response.status} ${response.statusText}`);
}

const document = await response.json();
const askResult = document?.components?.schemas?.AskResult;
const queryLanguage = document?.["x-anyshift-query-language"];
const exposureVariant = askResult?.oneOf?.find((variant) => variant?.properties?.intent?.const === "exposure");
const exposureResult = document?.components?.schemas?.ExposureResult;
const cloudEventsTable = queryLanguage?.tables?.find((table) => table?.name === "cloud_events");
const cloudEventsResult = document?.components?.schemas?.CloudEventsResult;
const cloudEventCorrelation = document?.components?.schemas?.CloudEventsResult
  ?.properties?.items?.items?.properties?.correlation;
const correlationsTable = queryLanguage?.tables?.find((table) => table?.name === "correlations");
const incidentsTable = queryLanguage?.tables?.find((table) => table?.name === "incidents");
const correlationsVariant = askResult?.oneOf?.find((variant) => variant?.properties?.intent?.const === "correlations");
const correlationsResult = document?.components?.schemas?.CorrelationsResult;
const canonicalExposureFields = [
  "direction",
  "exposed",
  "services",
  "ingresses",
  "perspective",
  "verdict",
  "subject",
  "candidates",
  "paths",
  "page",
];
if (
  document?.openapi !== "3.1.0"
  || askResult?.discriminator?.propertyName !== "intent"
  || askResult?.oneOf?.length !== 52
  || queryLanguage?.version !== "1.14"
  || queryLanguage?.tables?.length !== askResult.oneOf.length
  || exposureVariant?.properties?.exposure?.$ref !== "#/components/schemas/ExposureResult"
  || !exposureVariant?.required?.includes("exposure")
  || canonicalExposureFields.some((field) => !exposureResult?.required?.includes(field))
  || !cloudEventsTable?.filters?.some((filter) => filter?.name === "operation")
  || !cloudEventsTable?.filters?.some((filter) => filter?.name === "stats")
  || !cloudEventsResult?.required?.includes("statistics")
  || !cloudEventsResult?.properties?.total?.anyOf?.some((entry) => entry?.type === "null")
  || !cloudEventCorrelation?.required?.includes("providerOperationId")
  || correlationsTable?.intent !== "correlations"
  || correlationsTable?.deprecated !== undefined
  || incidentsTable?.intent !== "incident"
  || incidentsTable?.deprecated?.replacement !== "correlations"
  || !correlationsVariant?.required?.includes("correlations")
  || !correlationsVariant?.properties?.correlations?.oneOf?.some((entry) => entry?.$ref === "#/components/schemas/CorrelationsResult")
  || !correlationsVariant?.properties?.correlations?.oneOf?.some((entry) => entry?.type === "null")
  || !correlationsResult?.required?.includes("correlationId")
) {
  throw new Error(`${source} does not expose the expected executable 52-intent, query-language 1.14, correlations contract, optional cloud-event statistics, provider-operation, and canonical exposure contract`);
}

await writeFile(target, `${JSON.stringify(document, null, 2)}\n`);
console.log(`updated ${target.pathname} from ${source}`);
