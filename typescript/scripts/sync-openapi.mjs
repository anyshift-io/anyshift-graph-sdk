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
if (
  document?.openapi !== "3.1.0"
  || askResult?.discriminator?.propertyName !== "intent"
  || askResult?.oneOf?.length !== 42
  || queryLanguage?.version !== "1.1"
  || queryLanguage?.tables?.length !== askResult.oneOf.length
) {
  throw new Error(`${source} does not expose the expected executable 42-intent and query-language 1.1 contract`);
}

await writeFile(target, `${JSON.stringify(document, null, 2)}\n`);
console.log(`updated ${target.pathname} from ${source}`);
