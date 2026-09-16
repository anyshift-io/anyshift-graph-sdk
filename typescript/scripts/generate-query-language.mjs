import { readFile, writeFile } from "node:fs/promises";

const contractPath = new URL("../../openapi/graph-api.v1.json", import.meta.url);
const outputPath = new URL("../../QUERY_LANGUAGE.md", import.meta.url);
const check = process.argv.includes("--check");

const contract = JSON.parse(await readFile(contractPath, "utf8"));
const language = contract["x-anyshift-query-language"];

if (!["1.17-sdk.1", "1.23"].includes(language?.version) || !Array.isArray(language.tables) || language.tables.length === 0) {
  throw new Error(`${contractPath.pathname} does not contain x-anyshift-query-language version 1.17-sdk.1 or 1.23`);
}

const escapeCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const code = (value) => `\`${value}\``;
const list = (values) => values?.length ? values.map(code).join(", ") : "None";

function renderValues(filter) {
  if (!filter.values?.length) return "Any value";
  return filter.values.map((entry) => {
    const aliases = entry.aliases?.length ? ` (${entry.aliases.map(code).join(", ")})` : "";
    return `${code(entry.value)}${aliases}`;
  }).join("<br />");
}

const lines = [
  "# Anyshift Graph Query Language",
  "",
  `This reference describes the pinned SDK query catalog ${language.version}. The SDK snapshot extends the 1.17 baseline with contributor lookup; it does not claim complete parity with later server catalogs. It is generated from the SDK-pinned OpenAPI contract.`,
  "",
  "## Grammar",
  "",
  "```text",
  language.grammar,
  "```",
  "",
  `Supported selectors: ${list(language.selectors)}. Accepted selector aliases: ${list(language.selectorAliases)}.`,
  "",
  language.valueSyntax,
  "",
  "`LIMIT` and `OFFSET` are written after the optional `WHERE` clause. Each target below states whether the modifier is applied by that query.",
  "",
  "## Query Targets",
  "",
  "| Target | Purpose | Filters |",
  "| --- | --- | --- |",
  ...language.tables.map((table) => `| [${code(table.name)}](#${table.name}) | ${escapeCell(table.summary)} | ${table.filters.length ? table.filters.map((filter) => code(filter.name)).join(", ") : "None"} |`),
  "",
];

for (const table of language.tables) {
  lines.push(
    `## ${table.name}`,
    "",
    table.summary,
    "",
    `Result intent: ${code(table.intent)}.`,
    "",
    `Table aliases: ${list(table.aliases)}.`,
    "",
    `Modifiers: ${table.pagination.limit ? code("LIMIT") : `${code("LIMIT")} is not applied`}; ${table.pagination.offset ? code("OFFSET") : `${code("OFFSET")} is not applied`}.`,
    "",
  );

  if (table.filters.length) {
    lines.push(
      "### Filters",
      "",
      "| Filter | Type | Required | Accepted values | Description |",
      "| --- | --- | --- | --- | --- |",
      ...table.filters.map((filter) => `| ${code(filter.name)} | ${escapeCell(filter.type)} | ${filter.required ? "Yes" : "No"} | ${renderValues(filter)} | ${escapeCell(filter.description)} |`),
      "",
    );
  } else {
    lines.push("This target has no filters.", "");
  }

  lines.push("### Forms", "");
  for (const form of table.forms) {
    lines.push(
      `#### ${form.name}`,
      "",
      form.description,
      "",
      "```console",
      `$ annie graph query "${form.example}"`,
      "```",
      "",
    );
  }
}

lines.push(
  "## Related Documentation",
  "",
  "- [Annie CLI](https://docs.anyshift.io/pages/product/integration/cli)",
  "- [Graph SDK](https://docs.anyshift.io/pages/product/integration/sdk)",
  "- [Graph SDK capabilities](./CAPABILITIES.md)",
  "- [OpenAPI contract](./openapi/graph-api.v1.json)",
  "",
);

const rendered = `${lines.join("\n")}\n`;

if (check) {
  const existing = await readFile(outputPath, "utf8").catch(() => "");
  if (existing !== rendered) {
    throw new Error(`${outputPath.pathname} is stale; run npm run generate:query-language`);
  }
  console.log(`${outputPath.pathname} is up to date`);
} else {
  await writeFile(outputPath, rendered);
  console.log(`updated ${outputPath.pathname} from ${contractPath.pathname}`);
}
