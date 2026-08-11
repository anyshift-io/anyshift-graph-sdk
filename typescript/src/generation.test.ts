import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const checker = fileURLToPath(new URL("../scripts/check-openapi-generated.mjs", import.meta.url));

function checkGenerated(env: NodeJS.ProcessEnv = {}) {
  return spawnSync(process.execPath, [checker], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

test("generated OpenAPI types exactly match the pinned contract", () => {
  const result = checkGenerated();
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("generated OpenAPI drift check rejects a stale output file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "graph-sdk-openapi-drift-"));
  const staleOutput = join(directory, "openapi.generated.ts");
  await writeFile(staleOutput, "// deliberately stale\n");

  try {
    const result = checkGenerated({ OPENAPI_GENERATED_PATH: staleOutput });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /stale; run npm run generate:types/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
