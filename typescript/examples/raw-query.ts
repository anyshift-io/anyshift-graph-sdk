import { GraphAnswer } from "../src/index.js";

const token = process.env.ANYSHIFT_TOKEN;
const project = process.env.ANYSHIFT_PROJECT_ID;
const sql = process.argv.slice(2).join(" ");

if (!token || !project) {
  throw new Error("Set ANYSHIFT_TOKEN and ANYSHIFT_PROJECT_ID");
}

if (!sql) {
  throw new Error("Usage: tsx examples/raw-query.ts \"SELECT * FROM events LIMIT 5\"");
}

const graph = new GraphAnswer({ token, project });

const result = await graph.query(sql);
console.log(JSON.stringify(result, null, 2));
