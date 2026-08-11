import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript";

const contractPath = resolve(
  process.env.OPENAPI_CONTRACT_PATH ?? fileURLToPath(new URL("../../openapi/graph-api.v1.json", import.meta.url)),
);
const generatedPath = resolve(
  process.env.OPENAPI_GENERATED_PATH ?? fileURLToPath(new URL("../src/openapi.generated.ts", import.meta.url)),
);

const ast = await openapiTS(pathToFileURL(contractPath));
const expected = COMMENT_HEADER + astToString(ast);
const actual = await readFile(generatedPath, "utf8").catch(() => "");

if (actual !== expected) {
  throw new Error(`${generatedPath} is stale; run npm run generate:types`);
}

console.log(`${generatedPath} is up to date`);
