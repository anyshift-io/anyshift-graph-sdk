import { GraphAnswer } from "../src/index.js";

const token = process.env.ANYSHIFT_TOKEN;
const project = process.env.ANYSHIFT_PROJECT_ID;
const resource = process.argv[2];

if (!token || !project) {
  throw new Error("Set ANYSHIFT_TOKEN and ANYSHIFT_PROJECT_ID");
}

if (!resource) {
  throw new Error("Usage: tsx examples/blast-radius.ts <resource>");
}

const graph = new GraphAnswer({ token, project });

const result = await graph.blast({ resource });
console.log(result.summary);
