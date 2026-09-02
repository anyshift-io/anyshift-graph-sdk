import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pinned OpenAPI exposes the executable operational-response contract", async () => {
  const raw = await readFile(new URL("../../openapi/graph-api.v1.json", import.meta.url), "utf8");
  const document = JSON.parse(raw);
  const schemas = document.components.schemas;
  const variants = schemas.AskResult.oneOf;
  const queryLanguage = document["x-anyshift-query-language"];

  assert.equal(schemas.QueryRequest.additionalProperties, false);
  assert.equal(schemas.AskRequest.additionalProperties, false);
  assert.equal(schemas.AskResult.discriminator.propertyName, "intent");
  assert.equal(new Set(variants.map((variant: any) => variant.properties.intent.const)).size, variants.length);
  assert.equal(queryLanguage.version, "1.22");
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
  const events = queryLanguage.tables.find((table: any) => table.name === "events");
  const iac = queryLanguage.tables.find((table: any) => table.name === "iac");
  const iacDrift = queryLanguage.tables.find((table: any) => table.name === "iac_drift");
  const alertCause = queryLanguage.tables.find((table: any) => table.name === "alert_cause");
  for (const selector of ["target", "target_id"]) {
    assert.match(
      alertCause.filters.find((filter: any) => filter.name === selector).description,
      /exactly one of target or target_id is required/,
    );
  }
  const resolve = queryLanguage.tables.find((table: any) => table.name === "resolve");
  const blastRadius = queryLanguage.tables.find((table: any) => table.name === "blast_radius");
  const selectorFields = ["resource_type", "resource_namespace", "resource_cluster"];
  for (const [table, principal] of [[resolve, "term"], [blastRadius, "resource"]] as const) {
    const expected = [principal, "resource_id", ...selectorFields];
    assert.deepEqual(table.filters.map((filter: any) => filter.name), expected);
    assert.deepEqual(table.selector.exactlyOneOf, [principal, "resource_id"]);
    assert.deepEqual(table.selector.nonEmpty, expected);
    assert.deepEqual(table.selector.qualifiers, {
      fields: selectorFields,
      require: principal,
      forbidWith: "resource_id",
      routeExact: true,
    });
  }
  assert.ok(path.filters.some((filter: any) => filter.name === "from_type"));
  assert.ok(path.filters.some((filter: any) => filter.name === "scope"));
  assert.ok(topology.filters.find((filter: any) => filter.name === "source").values.some((entry: any) => entry.value === "tempo"));
  assert.ok(cloudEvents.filters.some((filter: any) => filter.name === "cursor"));
  for (const filter of ["from", "until", "stats", "cursor"]) {
    assert.ok(events.filters.some((entry: any) => entry.name === filter));
  }
  assert.ok(cloudEvents.filters.some((filter: any) => filter.name === "diff"));
  assert.ok(cloudEvents.filters.some((filter: any) => filter.name === "operation"));
  assert.deepEqual(
    cloudEvents.filters.find((filter: any) => filter.name === "stats").values.map((entry: any) => entry.value),
    ["exact", "none"],
  );
  const cloudEventsResult = schemas.CloudEventsResult;
  assert.ok(cloudEventsResult.properties.total.anyOf.some((entry: any) => entry.type === "null"));
  assert.deepEqual(cloudEventsResult.properties.statistics.properties.mode.enum, ["exact", "none"]);
  assert.equal(cloudEventsResult.properties.statistics.properties.exact.type, "boolean");
  const cloudEventCorrelation = cloudEventsResult.properties.items.items.properties.correlation;
  assert.deepEqual(cloudEventCorrelation.properties.providerOperationId.type, ["string", "null"]);
  assert.ok(cloudEventCorrelation.required.includes("providerOperationId"));
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
  for (const filter of ["target_id", "target_type", "namespace", "cluster", "alert", "from", "to"]) {
    assert.ok(alertCause.filters.some((entry: any) => entry.name === filter));
  }
  for (const field of ["workloadId", "workloadType", "cluster", "alert", "interval", "status", "suspect", "reason"]) {
    assert.ok(schemas.AlertCauseResult.required.includes(field));
  }
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
  const exposurePath = exposureResult.properties.paths.items;
  assert.ok(exposurePath.required.includes("platform"));
  const platformObject = exposurePath.properties.platform.anyOf.find((entry: any) => entry.type === "object");
  assert.ok(exposurePath.properties.platform.anyOf.some((entry: any) => entry.type === "null"));
  assert.deepEqual(
    [...platformObject.required].sort(),
    ["accountId", "id", "name", "observedAt", "provenance", "region", "relationship", "type"],
  );
  assert.equal(platformObject.properties.relationship.const, "HOSTS");
  assert.deepEqual(platformObject.properties.provenance.required, ["source"]);

  const correlations = queryLanguage.tables.find((table: any) => table.name === "correlations");
  const incidents = queryLanguage.tables.find((table: any) => table.name === "incidents");
  assert.equal(correlations.intent, "correlations");
  assert.equal(correlations.deprecated, undefined);
  assert.deepEqual(
    correlations.filters.map((filter: any) => filter.name),
    ["target", "id", "type", "since"],
  );
  assert.equal(incidents.intent, "incident");
  assert.deepEqual(incidents.deprecated, { since: "v1", replacement: "correlations" });
  const correlationsVariant = variants.find((variant: any) => variant.properties.intent.const === "correlations");
  assert.ok(correlationsVariant.required.includes("correlations"));
  assert.ok(
    correlationsVariant.properties.correlations.oneOf.some(
      (entry: any) => entry.$ref === "#/components/schemas/CorrelationsResult",
    ),
  );
  assert.ok(correlationsVariant.properties.correlations.oneOf.some((entry: any) => entry.type === "null"));
  assert.ok(schemas.CorrelationsResult.required.includes("correlationId"));

  const alerts = queryLanguage.tables.find((table: any) => table.name === "alerts");
  const responseIncidents = queryLanguage.tables.find((table: any) => table.name === "response_incidents");
  const onCall = queryLanguage.tables.find((table: any) => table.name === "oncall");
  assert.equal(alerts.intent, "alerts");
  assert.ok(alerts.filters.some((filter: any) => filter.name === "provider"));
  assert.ok(alerts.filters.some((filter: any) => filter.name === "service_id"));
  assert.equal(responseIncidents.intent, "responseincidents");
  assert.ok(responseIncidents.filters.some((filter: any) => filter.name === "responder"));
  assert.deepEqual(
    responseIncidents.filters.find((filter: any) => filter.name === "status").values.map((entry: any) => entry.value),
    ["active", "open", "acknowledged", "resolved", "unknown", "all"],
  );
  assert.equal(onCall.intent, "oncall");
  assert.ok(onCall.filters.some((filter: any) => filter.name === "person"));
  for (const schema of [schemas.AlertsResult, schemas.ResponseIncidentsResult, schemas.OnCallResult]) {
    assert.ok(schema.required.includes("items"));
    assert.ok(schema.required.includes("providers"));
    assert.ok(schema.required.includes("warnings"));
  }
  const responderIdentity = schemas.ResponseIncidentsResult.properties.items.items
    .properties.responders.items;
  const onCallIdentity = schemas.OnCallResult.properties.items.items.properties.person;
  for (const identity of [responderIdentity, onCallIdentity]) {
    assert.ok(identity.required.includes("candidates"));
    assert.equal(identity.properties.candidates.maxItems, 10);
    assert.deepEqual(identity.properties.candidates.items.required, ["personId", "name", "email"]);
  }
});
