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
const alertsTable = queryLanguage?.tables?.find((table) => table?.name === "alerts");
const responseIncidentsTable = queryLanguage?.tables?.find((table) => table?.name === "response_incidents");
const onCallTable = queryLanguage?.tables?.find((table) => table?.name === "oncall");
const responseIncidentsVariant = askResult?.oneOf?.find((variant) => variant?.properties?.intent?.const === "responseincidents");
const onCallVariant = askResult?.oneOf?.find((variant) => variant?.properties?.intent?.const === "oncall");
const alertsResult = document?.components?.schemas?.AlertsResult;
const responseIncidentsResult = document?.components?.schemas?.ResponseIncidentsResult;
const onCallResult = document?.components?.schemas?.OnCallResult;
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
const exposurePath = exposureResult?.properties?.paths?.items;
const exposurePlatform = exposurePath?.properties?.platform;
const exposurePlatformObject = exposurePlatform?.anyOf?.find((entry) => entry?.type === "object");
const exposurePlatformFields = [
  "type",
  "id",
  "name",
  "accountId",
  "region",
  "relationship",
  "observedAt",
  "provenance",
];
if (
  document?.openapi !== "3.1.0"
  || askResult?.discriminator?.propertyName !== "intent"
  || queryLanguage?.version !== "1.15"
  || queryLanguage?.tables?.length !== askResult.oneOf.length
  || exposureVariant?.properties?.exposure?.$ref !== "#/components/schemas/ExposureResult"
  || !exposureVariant?.required?.includes("exposure")
  || canonicalExposureFields.some((field) => !exposureResult?.required?.includes(field))
  || !exposurePath?.required?.includes("platform")
  || !exposurePlatform?.anyOf?.some((entry) => entry?.type === "null")
  || exposurePlatformFields.some((field) => !exposurePlatformObject?.required?.includes(field))
  || exposurePlatformObject?.properties?.relationship?.const !== "HOSTS"
  || !exposurePlatformObject?.properties?.provenance?.required?.includes("source")
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
  || alertsTable?.intent !== "alerts"
  || !alertsTable?.filters?.some((filter) => filter?.name === "provider")
  || !alertsTable?.filters?.some((filter) => filter?.name === "service_id")
  || responseIncidentsTable?.intent !== "responseincidents"
  || !responseIncidentsTable?.filters?.some((filter) => filter?.name === "responder")
  || onCallTable?.intent !== "oncall"
  || !onCallTable?.filters?.some((filter) => filter?.name === "person")
  || !responseIncidentsVariant?.required?.includes("incidents")
  || !onCallVariant?.required?.includes("onCall")
  || !alertsResult?.required?.includes("items")
  || !alertsResult?.required?.includes("providers")
  || !responseIncidentsResult?.required?.includes("items")
  || !responseIncidentsResult?.required?.includes("providers")
  || !onCallResult?.required?.includes("items")
  || !onCallResult?.required?.includes("providers")
) {
  throw new Error(`${source} does not expose the expected executable query-language 1.15 correlations, operational-response, cloud-event, canonical exposure, and exposure platform contract`);
}

await writeFile(target, `${JSON.stringify(document, null, 2)}\n`);
console.log(`updated ${target.pathname} from ${source}`);
