import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pinned OpenAPI exposes the executable 42-intent contract", async () => {
  const raw = await readFile(new URL("../../openapi/graph-api.v1.json", import.meta.url), "utf8");
  const document = JSON.parse(raw);
  const schemas = document.components.schemas;
  const variants = schemas.AskResult.oneOf;
  const queryLanguage = document["x-anyshift-query-language"];

  assert.equal(schemas.QueryRequest.additionalProperties, false);
  assert.equal(schemas.AskRequest.additionalProperties, false);
  assert.equal(schemas.AskResult.discriminator.propertyName, "intent");
  assert.equal(variants.length, 42);
  assert.equal(new Set(variants.map((variant: any) => variant.properties.intent.const)).size, 42);
  assert.equal(queryLanguage.version, "1.1");
  assert.equal(queryLanguage.tables.length, variants.length);
  const spof = queryLanguage.tables.find((table: any) => table.name === "spof");
  assert.deepEqual(spof.filters.find((filter: any) => filter.name === "kind").values.map((entry: any) => entry.value), [
    "configmap",
    "serviceaccount",
    "node",
  ]);
  const path = queryLanguage.tables.find((table: any) => table.name === "path");
  const topology = queryLanguage.tables.find((table: any) => table.name === "topology");
  assert.ok(path.filters.some((filter: any) => filter.name === "from_type"));
  assert.ok(path.filters.some((filter: any) => filter.name === "scope"));
  assert.ok(topology.filters.find((filter: any) => filter.name === "source").values.some((entry: any) => entry.value === "tempo"));
});
