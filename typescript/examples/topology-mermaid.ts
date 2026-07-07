import { GraphAnswer, toMermaid } from "../src/index.js";

const token = process.env.ANYSHIFT_API_TOKEN;
const project = process.env.ANYSHIFT_PROJECT_ID;

if (!token || !project) {
  throw new Error("Set ANYSHIFT_API_TOKEN and ANYSHIFT_PROJECT_ID");
}

const graph = new GraphAnswer({ token, project });

const result = await graph.topology({ service: "checkout", level: "container" });
console.log(toMermaid(result));
