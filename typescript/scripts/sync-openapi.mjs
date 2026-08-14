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
  || askResult?.oneOf?.length !== 51
  || queryLanguage?.version !== "1.13"
  || queryLanguage?.tables?.length !== askResult.oneOf.length
  || exposureVariant?.properties?.exposure?.$ref !== "#/components/schemas/ExposureResult"
  || !exposureVariant?.required?.includes("exposure")
  || canonicalExposureFields.some((field) => !exposureResult?.required?.includes(field))
  || !cloudEventsTable?.filters?.some((filter) => filter?.name === "operation")
  || !cloudEventsTable?.filters?.some((filter) => filter?.name === "stats")
  || !cloudEventsResult?.required?.includes("statistics")
  || !cloudEventsResult?.properties?.total?.anyOf?.some((entry) => entry?.type === "null")
  || !cloudEventCorrelation?.required?.includes("providerOperationId")
) {
  throw new Error(`${source} does not expose the expected executable 51-intent, query-language 1.13, optional cloud-event statistics, provider-operation, and canonical exposure contract`);
}

await writeFile(target, `${JSON.stringify(document, null, 2)}\n`);
console.log(`updated ${target.pathname} from ${source}`);
