import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sdkDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const directory = await mkdtemp(join(tmpdir(), "graph-sdk-clean-consumer-"));
const consumerDirectory = join(directory, "consumer");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? sdkDirectory,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: join(directory, "npm-cache") },
  });
  if (result.status !== 0) {
    throw new Error([
      `${command} ${args.join(" ")} failed with status ${result.status}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join("\n"));
  }
  return result.stdout;
}

try {
  await mkdir(consumerDirectory);
  const packed = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", directory]));
  const tarball = join(directory, packed[0].filename);
  await writeFile(join(consumerDirectory, "package.json"), JSON.stringify({
    name: "graph-sdk-clean-consumer",
    private: true,
    type: "module",
  }, null, 2));
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], {
    cwd: consumerDirectory,
  });

  await writeFile(join(consumerDirectory, "consumer.mts"), `
import { GraphAnswer } from "@anyshift/graph-sdk";
import type {
  AskResultFor,
  ExposureControl,
  ExposureEvidence,
  ExposureGap,
  ExposureHop,
  ExposureIngressRef,
  ExposurePath,
  ExposurePerspective,
  ExposureResource,
  ExposureResult,
  ExposureService,
  ExposureVerdict,
} from "@anyshift/graph-sdk";

declare const client: GraphAnswer;
const result: Promise<AskResultFor<"exposure">> = client.exposure({
  resource: { id: "resource-hash" },
  cursor: "next-page",
});
declare const exposure: ExposureResult;
const service: ExposureService | undefined = exposure.services[0];
const ingress: ExposureIngressRef | undefined = exposure.ingresses[0];
const perspective: ExposurePerspective = exposure.perspective;
const verdict: ExposureVerdict = exposure.verdict;
const resource: ExposureResource | null = exposure.subject;
const path: ExposurePath | undefined = exposure.paths[0];
declare const hop: ExposureHop;
declare const control: ExposureControl;
declare const gap: ExposureGap;
const evidence: ExposureEvidence = hop.evidence;
void result;
void service;
void ingress;
void perspective;
void verdict;
void resource;
void path;
void control;
void gap;
void evidence;
`);
  const typescript = join(sdkDirectory, "node_modules", "typescript", "bin", "tsc");
  run(process.execPath, [
    typescript,
    "--noEmit",
    "--strict",
    "--skipLibCheck",
    "--target", "ES2022",
    "--module", "NodeNext",
    "--moduleResolution", "NodeNext",
    "consumer.mts",
  ], { cwd: consumerDirectory });

  await writeFile(join(consumerDirectory, "consumer.mjs"), `
import assert from "node:assert/strict";
import { GraphAnswer } from "@anyshift/graph-sdk";

let sql;
const client = new GraphAnswer({
  baseUrl: "http://x",
  fetch: async (_url, init) => {
    sql = JSON.parse(init.body).sql;
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        question: "",
        intent: "exposure",
        summary: "ok",
        exposure: {
          direction: "workload",
          exposed: true,
          services: [],
          ingresses: [],
          perspective: "workload_to_edge",
          verdict: "confirmed",
          subject: null,
          candidates: [],
          paths: [],
          page: { limit: 20, hasMore: false, nextCursor: null },
        },
      }),
    };
  },
});
const result = await client.exposure({ resource: { id: "resource-hash" }, cursor: "next-page" });
assert.equal(sql, "SELECT * FROM exposure WHERE resource_id = 'resource-hash' AND cursor = 'next-page'");
assert.equal(result.exposure.verdict, "confirmed");
console.log("clean consumer imported, typed, and used @anyshift/graph-sdk");
`);
  run(process.execPath, ["consumer.mjs"], { cwd: consumerDirectory });

  const packageJson = JSON.parse(await readFile(join(consumerDirectory, "node_modules", "@anyshift", "graph-sdk", "package.json"), "utf8"));
  console.log(`verified clean packed consumer for @anyshift/graph-sdk@${packageJson.version}`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
