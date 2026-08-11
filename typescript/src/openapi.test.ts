import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pinned OpenAPI exposes the executable 51-intent contract", async () => {
  const raw = await readFile(new URL("../../openapi/graph-api.v1.json", import.meta.url), "utf8");
  const document = JSON.parse(raw);
  const schemas = document.components.schemas;
  const variants = schemas.AskResult.oneOf;
  const queryLanguage = document["x-anyshift-query-language"];

  assert.equal(schemas.QueryRequest.additionalProperties, false);
  assert.equal(schemas.AskRequest.additionalProperties, false);
  assert.equal(schemas.AskResult.discriminator.propertyName, "intent");
  assert.equal(variants.length, 51);
  assert.equal(new Set(variants.map((variant: any) => variant.properties.intent.const)).size, 51);
  assert.equal(queryLanguage.version, "1.11");
  assert.equal(queryLanguage.tables.length, variants.length);
  const inventorySample = schemas.InventoryResult.properties.sample.items;
  assert.deepEqual(inventorySample.properties.resourceId.type, ["string", "null"]);
  assert.ok(inventorySample.required.includes("resourceId"));
  const spof = queryLanguage.tables.find((table: any) => table.name === "spof");
  assert.deepEqual(spof.filters.find((filter: any) => filter.name === "kind").values.map((entry: any) => entry.value), [
    "configmap",
    "serviceaccount",
    "node",
  ]);
  const path = queryLanguage.tables.find((table: any) => table.name === "path");
  const topology = queryLanguage.tables.find((table: any) => table.name === "topology");
  const cloudEvents = queryLanguage.tables.find((table: any) => table.name === "cloud_events");
  const iac = queryLanguage.tables.find((table: any) => table.name === "iac");
  const iacDrift = queryLanguage.tables.find((table: any) => table.name === "iac_drift");
  assert.ok(path.filters.some((filter: any) => filter.name === "from_type"));
  assert.ok(path.filters.some((filter: any) => filter.name === "scope"));
  assert.ok(topology.filters.find((filter: any) => filter.name === "source").values.some((entry: any) => entry.value === "tempo"));
  assert.ok(cloudEvents.filters.some((filter: any) => filter.name === "cursor"));
  assert.ok(cloudEvents.filters.some((filter: any) => filter.name === "diff"));
  const cloudResources = queryLanguage.tables.find((table: any) => table.name === "cloud_resources");
  const impact = queryLanguage.tables.find((table: any) => table.name === "operational_impact");
  const delivery = queryLanguage.tables.find((table: any) => table.name === "delivery_events");
  const provenance = queryLanguage.tables.find((table: any) => table.name === "provenance");
  const ownership = queryLanguage.tables.find((table: any) => table.name === "ownership");
  const graphCoverage = queryLanguage.tables.find((table: any) => table.name === "graph_coverage");
  const exposureTable = queryLanguage.tables.find((table: any) => table.name === "exposure");
  assert.ok(cloudResources);
  assert.equal(cloudResources.intent, "cloudresources");
  assert.ok(cloudResources.filters.some((filter: any) => filter.name === "provenance"));
  assert.ok(cloudResources.filters.some((filter: any) => filter.name === "max_age"));
  assert.equal(impact.intent, "impact");
  assert.ok(impact.filters.some((filter: any) => filter.name === "depth"));
  assert.equal(delivery.intent, "deliveryevents");
  assert.equal(provenance.intent, "provenance");
  assert.equal(ownership.intent, "ownership");
  assert.equal(graphCoverage.intent, "graphcoverage");
  assert.ok(graphCoverage.filters.find((filter: any) => filter.name === "source").values.some((entry: any) => entry.value === "dynatrace"));
  assert.ok(topology.filters.find((filter: any) => filter.name === "source").values.some((entry: any) => entry.value === "dynatrace"));
  assert.ok(iac.filters.some((filter: any) => filter.name === "freshness"));
  assert.ok(iacDrift.filters.some((filter: any) => filter.name === "status"));
  assert.deepEqual(
    exposureTable.filters.map((filter: any) => filter.name),
    ["resource", "resource_id", "resource_type", "resource_namespace", "resource_cluster", "cursor"],
  );

  const exposureResult = schemas.ExposureResult;
  assert.deepEqual(
    [...exposureResult.required].sort(),
    [
      "candidates",
      "direction",
      "exposed",
      "ingresses",
      "page",
      "paths",
      "perspective",
      "services",
      "subject",
      "verdict",
    ].sort(),
  );
  const exposureVariant = variants.find((variant: any) => variant.properties.intent.const === "exposure");
  assert.ok(exposureVariant.required.includes("exposure"));
  assert.equal(exposureVariant.properties.exposure.$ref, "#/components/schemas/ExposureResult");
  assert.equal(exposureVariant.properties.exposure.anyOf, undefined);
});
