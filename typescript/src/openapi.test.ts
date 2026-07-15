import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pinned OpenAPI exposes the executable 41-intent contract", async () => {
  const raw = await readFile(new URL("../../openapi/graph-api.v1.json", import.meta.url), "utf8");
  const document = JSON.parse(raw);
  const schemas = document.components.schemas;
  const variants = schemas.AskResult.oneOf;

  assert.equal(schemas.QueryRequest.additionalProperties, false);
  assert.equal(schemas.AskRequest.additionalProperties, false);
  assert.equal(schemas.AskResult.discriminator.propertyName, "intent");
  assert.equal(variants.length, 41);
  assert.equal(new Set(variants.map((variant: any) => variant.properties.intent.const)).size, 41);
});
