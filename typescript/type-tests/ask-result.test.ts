import type { AskResult, AskResultFor, GraphIntent } from "../src/index.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

type ExpectedIntent =
  | "connections" | "inventory" | "events" | "hotspots" | "incident" | "failures"
  | "deployments" | "audit" | "nodes" | "deployimpact" | "commoncause" | "blast"
  | "spof" | "path" | "cascade" | "alertimpact" | "monitor" | "datastore" | "flow"
  | "externaldep" | "alerts" | "alertnoise" | "calls" | "servicetree" | "alertcause"
  | "access" | "exposure" | "orphans" | "coverage" | "slo" | "tenancy"
  | "sharedconfig" | "alertrules" | "gitops" | "image" | "netpol" | "storage"
  | "pdb" | "scaling" | "topology" | "priority";

type _AllIntentsAreExported = Assert<Equal<GraphIntent, ExpectedIntent>>;

declare const result: AskResult;

if (result.intent === "inventory") {
  const total: number | undefined = result.inventory?.total;
  void total;
  // @ts-expect-error discriminating inventory must exclude event payloads
  result.events;
}

if (result.intent === "events") {
  const total: number | undefined = result.events?.total;
  void total;
  // @ts-expect-error discriminating events must exclude inventory payloads
  result.inventory;
}

declare const inventory: AskResultFor<"inventory">;
const inventoryIntent: "inventory" = inventory.intent;
const inventoryTotal: number | undefined = inventory.inventory?.total;
void inventoryIntent;
void inventoryTotal;
