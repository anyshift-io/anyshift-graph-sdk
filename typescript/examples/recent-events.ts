import { GraphAnswer } from "../src/index.js";

const token = process.env.ANYSHIFT_TOKEN;
const project = process.env.ANYSHIFT_PROJECT_ID;

if (!token || !project) {
  throw new Error("Set ANYSHIFT_TOKEN and ANYSHIFT_PROJECT_ID");
}

const graph = new GraphAnswer({ token, project });

const [from, until] = process.argv.slice(2);
const result = from && until
  ? await graph.events({ from, until, stats: "none", limit: 10 })
  : await graph.events({ since: "1h", limit: 10 });
console.log(result.summary);
