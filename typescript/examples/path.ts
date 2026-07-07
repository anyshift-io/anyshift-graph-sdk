import { GraphAnswer } from "../src/index.js";

const token = process.env.ANYSHIFT_API_TOKEN;
const project = process.env.ANYSHIFT_PROJECT_ID;
const [from, to] = process.argv.slice(2);

if (!token || !project) {
  throw new Error("Set ANYSHIFT_API_TOKEN and ANYSHIFT_PROJECT_ID");
}

if (!from || !to) {
  throw new Error("Usage: tsx examples/path.ts <from> <to>");
}

const graph = new GraphAnswer({ token, project });

const result = await graph.path({ from, to });
console.log(result.summary);
