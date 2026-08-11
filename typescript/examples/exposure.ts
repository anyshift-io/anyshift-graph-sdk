import { GraphAnswer } from "../src/index.js";

const token = process.env.ANYSHIFT_TOKEN;
const project = process.env.ANYSHIFT_PROJECT_ID;
const [name, type, namespace, cluster] = process.argv.slice(2);

if (!token || !project) {
  throw new Error("Set ANYSHIFT_TOKEN and ANYSHIFT_PROJECT_ID");
}

if (!name || !type) {
  throw new Error("Usage: tsx examples/exposure.ts <name> <type> [namespace] [cluster]");
}

const graph = new GraphAnswer({ token, project });
const result = await graph.exposure({
  resource: { name, type, namespace, cluster },
  limit: 20,
});

console.log(JSON.stringify(result.exposure, null, 2));
