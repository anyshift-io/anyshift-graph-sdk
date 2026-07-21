import { test } from "node:test";
import assert from "node:assert/strict";
import { GraphAnswer } from "./client.js";

// Capture the composed SQL/body the method sends.
function capturing() {
  const calls: { path: string; body: any }[] = [];
  const gx = new GraphAnswer({
    baseUrl: "http://x",
    fetch: async (url, init) => {
      calls.push({ path: url.replace("http://x", ""), body: JSON.parse(init.body) });
      return { ok: true, status: 200, text: async () => JSON.stringify({ intent: "events", summary: "ok" }) };
    },
  });
  return { gx, calls };
}

test("connections composes resource SQL", async () => {
  const { gx, calls } = capturing();
  await gx.connections({ resource: "harvestor" });
  assert.equal(calls[0].path, "/v1/query");
  assert.equal(calls[0].body.sql, "SELECT * FROM connections WHERE resource = 'harvestor'");
});

test("resolve composes term and limit SQL", async () => {
  const { gx, calls } = capturing();
  await gx.resolve({ term: "checkout api", limit: 20 });
  assert.equal(calls[0].body.sql, "SELECT * FROM resolve WHERE term = 'checkout api' LIMIT 20");
});

test("inventory composes type SQL", async () => {
  const { gx, calls } = capturing();
  await gx.inventory({ type: "service" });
  assert.equal(calls[0].body.sql, "SELECT * FROM resources WHERE type = 'service'");
});

test("events composes filters + limit in fixed order", async () => {
  const { gx, calls } = capturing();
  await gx.events({ type: "oom", since: "1h", limit: 50 });
  assert.equal(calls[0].body.sql, "SELECT * FROM events WHERE type = 'oom' AND since = '1h' LIMIT 50");
});

test("events noise=all is emitted", async () => {
  const { gx, calls } = capturing();
  await gx.events({ type: "unhealthy", noise: "all" });
  assert.equal(calls[0].body.sql, "SELECT * FROM events WHERE type = 'unhealthy' AND noise = 'all'");
});

test("hotspots composes type + by", async () => {
  const { gx, calls } = capturing();
  await gx.hotspots({ type: "oom", by: "resource", limit: 10 });
  assert.equal(calls[0].body.sql, "SELECT * FROM hotspots WHERE type = 'oom' AND by = 'resource' LIMIT 10");
});

test("hotspots ranks alert-rule firings by dimension", async () => {
  const { gx, calls } = capturing();
  await gx.hotspots({ by: "alertrule", namespace: "storefront", limit: 5 });
  assert.equal(calls[0].body.sql, "SELECT * FROM hotspots WHERE by = 'alertrule' AND namespace = 'storefront' LIMIT 5");
});

test("incident by target and by id", async () => {
  const a = capturing();
  await a.gx.incident({ target: "places" });
  assert.equal(a.calls[0].body.sql, "SELECT * FROM incidents WHERE target = 'places'");
  const b = capturing();
  await b.gx.incident({ id: "519a304c-7b21-5c0f-86b9-05944e36c8ae" });
  assert.equal(b.calls[0].body.sql, "SELECT * FROM incidents WHERE id = '519a304c-7b21-5c0f-86b9-05944e36c8ae'");
});

test("failures composes scoped SQL", async () => {
  const { gx, calls } = capturing();
  await gx.failures({ namespace: "payment", since: "2h", limit: 10 });
  assert.equal(calls[0].body.sql, "SELECT * FROM failures WHERE namespace = 'payment' AND since = '2h' LIMIT 10");
});

test("deployments, audit (with type), nodes compose correctly", async () => {
  const d = capturing();
  await d.gx.deployments({ since: "1h" });
  assert.equal(d.calls[0].body.sql, "SELECT * FROM deployments WHERE since = '1h'");
  const a = capturing();
  await a.gx.audit({ type: "role" });
  assert.equal(a.calls[0].body.sql, "SELECT * FROM audit WHERE type = 'role'");
  const n = capturing();
  await n.gx.nodes({ since: "6h" });
  assert.equal(n.calls[0].body.sql, "SELECT * FROM nodes WHERE since = '6h'");
});

test("deployImpact composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.deployImpact();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM deploy_impact");
  const t = capturing();
  await t.gx.deployImpact({ target: "pro-pim", since: "24h" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM deploy_impact WHERE target = 'pro-pim' AND since = '24h'");
});

test("commonCause composes cluster-wide and namespace-scoped SQL", async () => {
  const r = capturing();
  await r.gx.commonCause();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM common_cause");
  const n = capturing();
  await n.gx.commonCause({ namespace: "payment", since: "2h" });
  assert.equal(n.calls[0].body.sql, "SELECT * FROM common_cause WHERE namespace = 'payment' AND since = '2h'");
});

test("blast composes resource SQL", async () => {
  const { gx, calls } = capturing();
  await gx.blast({ resource: "central-authentication-service-warmup" });
  assert.equal(calls[0].body.sql, "SELECT * FROM blast_radius WHERE resource = 'central-authentication-service-warmup'");
});

test("spof composes default and kind-scoped SQL", async () => {
  const d = capturing();
  await d.gx.spof();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM spof");
  const k = capturing();
  await k.gx.spof({ kind: "serviceaccount", namespace: "payment", limit: 5 });
  assert.equal(k.calls[0].body.sql, "SELECT * FROM spof WHERE kind = 'serviceaccount' AND namespace = 'payment' LIMIT 5");
});

test("orphans composes default and kind-scoped SQL", async () => {
  const d = capturing();
  await d.gx.orphans();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM orphans");
  const k = capturing();
  await k.gx.orphans({ kind: "role", namespace: "payment", limit: 5 });
  assert.equal(k.calls[0].body.sql, "SELECT * FROM orphans WHERE kind = 'role' AND namespace = 'payment' LIMIT 5");
});

test("coverage composes default and kind-scoped SQL", async () => {
  const d = capturing();
  await d.gx.coverage();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM coverage");
  const k = capturing();
  await k.gx.coverage({ kind: "monitor", namespace: "payment", limit: 5 });
  assert.equal(k.calls[0].body.sql, "SELECT * FROM coverage WHERE kind = 'monitor' AND namespace = 'payment' LIMIT 5");
  const m = capturing();
  await m.gx.coverage({ kind: "metrics", namespace: "storefront" });
  assert.equal(m.calls[0].body.sql, "SELECT * FROM coverage WHERE kind = 'metrics' AND namespace = 'storefront'");
});

test("alertRules composes default, inventory, and target SQL", async () => {
  const d = capturing();
  await d.gx.alertRules();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM alertrules");
  const i = capturing();
  await i.gx.alertRules({ subject: "inventory", namespace: "appqueue", limit: 5 });
  assert.equal(i.calls[0].body.sql, "SELECT * FROM alertrules WHERE subject = 'inventory' AND namespace = 'appqueue' LIMIT 5");
  const t = capturing();
  await t.gx.alertRules({ subject: "target", target: "appqueue-notifier" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM alertrules WHERE subject = 'target' AND target = 'appqueue-notifier'");
});

test("netpol composes uncovered/policy/segmentation SQL", async () => {
  const d = capturing();
  await d.gx.netpol();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM netpol");
  const u = capturing();
  await u.gx.netpol({ namespace: "payment", limit: 5 });
  assert.equal(u.calls[0].body.sql, "SELECT * FROM netpol WHERE namespace = 'payment' LIMIT 5");
  const p = capturing();
  await p.gx.netpol({ mode: "policy", target: "payments-api" });
  assert.equal(p.calls[0].body.sql, "SELECT * FROM netpol WHERE mode = 'policy' AND target = 'payments-api'");
  const s = capturing();
  await s.gx.netpol({ mode: "segmentation", target: "payments-api" });
  assert.equal(s.calls[0].body.sql, "SELECT * FROM netpol WHERE mode = 'segmentation' AND target = 'payments-api'");
});

test("priority composes nopriority/ladder/target SQL", async () => {
  const d = capturing();
  await d.gx.priority();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM priority");
  const n = capturing();
  await n.gx.priority({ namespace: "payment", limit: 5 });
  assert.equal(n.calls[0].body.sql, "SELECT * FROM priority WHERE namespace = 'payment' LIMIT 5");
  const l = capturing();
  await l.gx.priority({ kind: "ladder" });
  assert.equal(l.calls[0].body.sql, "SELECT * FROM priority WHERE kind = 'ladder'");
  const t = capturing();
  await t.gx.priority({ target: "payments-api" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM priority WHERE target = 'payments-api'");
});

test("storage composes footprint/orphanpv/unclaimedpvc/byclass SQL", async () => {
  const f = capturing();
  await f.gx.storage({ workload: "mariadb-payout" });
  assert.equal(f.calls[0].body.sql, "SELECT * FROM storage WHERE workload = 'mariadb-payout'");
  const o = capturing();
  await o.gx.storage({ mode: "orphanpv", class: "pd-ssd-retain", limit: 5 });
  assert.equal(o.calls[0].body.sql, "SELECT * FROM storage WHERE mode = 'orphanpv' AND class = 'pd-ssd-retain' LIMIT 5");
  const u = capturing();
  await u.gx.storage({ mode: "unclaimedpvc", namespace: "payments" });
  assert.equal(u.calls[0].body.sql, "SELECT * FROM storage WHERE mode = 'unclaimedpvc' AND namespace = 'payments'");
  const b = capturing();
  await b.gx.storage({ mode: "byclass" });
  assert.equal(b.calls[0].body.sql, "SELECT * FROM storage WHERE mode = 'byclass'");
});

test("pdb composes blind-spot and target SQL", async () => {
  const d = capturing();
  await d.gx.pdb();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM pdb");
  const t = capturing();
  await t.gx.pdb({ target: "payment", limit: 5 });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM pdb WHERE target = 'payment' LIMIT 5");
});

test("scaling composes nohpa/autoscaled/target SQL", async () => {
  const d = capturing();
  await d.gx.scaling();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM scaling");
  const n = capturing();
  await n.gx.scaling({ namespace: "payment", limit: 5 });
  assert.equal(n.calls[0].body.sql, "SELECT * FROM scaling WHERE namespace = 'payment' LIMIT 5");
  const a = capturing();
  await a.gx.scaling({ mode: "autoscaled" });
  assert.equal(a.calls[0].body.sql, "SELECT * FROM scaling WHERE mode = 'autoscaled'");
  const t = capturing();
  await t.gx.scaling({ mode: "target", target: "payments-api" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM scaling WHERE mode = 'target' AND target = 'payments-api'");
});

test("gitops composes drift/unmanaged/owner SQL", async () => {
  const d = capturing();
  await d.gx.gitops();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM gitops");
  const u = capturing();
  await u.gx.gitops({ subject: "unmanaged", namespace: "payment", limit: 5 });
  assert.equal(u.calls[0].body.sql, "SELECT * FROM gitops WHERE subject = 'unmanaged' AND namespace = 'payment' LIMIT 5");
  const o = capturing();
  await o.gx.gitops({ subject: "owner", resource: "payments-api" });
  assert.equal(o.calls[0].body.sql, "SELECT * FROM gitops WHERE subject = 'owner' AND resource = 'payments-api'");
});

test("access composes resource SQL and the privileged mode", async () => {
  const { gx, calls } = capturing();
  await gx.access({ resource: "ci-deployer" });
  assert.equal(calls[0].body.sql, "SELECT * FROM access WHERE resource = 'ci-deployer'");
  const l = capturing();
  await l.gx.access({ resource: "secrets-reader", limit: 5 });
  assert.equal(l.calls[0].body.sql, "SELECT * FROM access WHERE resource = 'secrets-reader' LIMIT 5");
  const p = capturing();
  await p.gx.access({ mode: "privileged", limit: 10 });
  assert.equal(p.calls[0].body.sql, "SELECT * FROM access WHERE mode = 'privileged' LIMIT 10");
});

test("exposure composes resource SQL", async () => {
  const { gx, calls } = capturing();
  await gx.exposure({ resource: "public-ingress" });
  assert.equal(calls[0].body.sql, "SELECT * FROM exposure WHERE resource = 'public-ingress'");
  const l = capturing();
  await l.gx.exposure({ resource: "checkout-api", limit: 5 });
  assert.equal(l.calls[0].body.sql, "SELECT * FROM exposure WHERE resource = 'checkout-api' LIMIT 5");
});

test("tenancy composes resource SQL", async () => {
  const { gx, calls } = capturing();
  await gx.tenancy({ resource: "payments-api" });
  assert.equal(calls[0].body.sql, "SELECT * FROM tenancy WHERE resource = 'payments-api'");
  const l = capturing();
  await l.gx.tenancy({ resource: "node-01", limit: 5 });
  assert.equal(l.calls[0].body.sql, "SELECT * FROM tenancy WHERE resource = 'node-01' LIMIT 5");
});

test("image composes default, target, and hygiene SQL", async () => {
  const d = capturing();
  await d.gx.image();
  assert.equal(d.calls[0].body.sql, "SELECT * FROM image");
  const t = capturing();
  await t.gx.image({ target: "proxyv2:1.29.4", limit: 5 });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM image WHERE target = 'proxyv2:1.29.4' LIMIT 5");
  const k = capturing();
  await k.gx.image({ kind: "nomemlimit", namespace: "payment" });
  assert.equal(k.calls[0].body.sql, "SELECT * FROM image WHERE kind = 'nomemlimit' AND namespace = 'payment'");
  const w = capturing();
  await w.gx.image({ workload: "payments-api" });
  assert.equal(w.calls[0].body.sql, "SELECT * FROM image WHERE workload = 'payments-api'");
});

test("sharedConfig composes resource SQL", async () => {
  const { gx, calls } = capturing();
  await gx.sharedConfig({ resource: "payments-api" });
  assert.equal(calls[0].body.sql, "SELECT * FROM sharedconfig WHERE resource = 'payments-api'");
  const l = capturing();
  await l.gx.sharedConfig({ resource: "app-config", limit: 5 });
  assert.equal(l.calls[0].body.sql, "SELECT * FROM sharedconfig WHERE resource = 'app-config' LIMIT 5");
});

test("path composes from/to SQL", async () => {
  const { gx, calls } = capturing();
  await gx.path({ from: "central-authentication-service", to: "kube-dns" });
  assert.equal(calls[0].body.sql, "SELECT * FROM path WHERE from = 'central-authentication-service' AND to = 'kube-dns'");
});

test("cascade composes target and id SQL", async () => {
  const t = capturing();
  await t.gx.cascade({ target: "places" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM cascade WHERE target = 'places'");
  const i = capturing();
  await i.gx.cascade({ id: "f48063a4-d4d7-5a0b-93bf-da87cc126940" });
  assert.equal(i.calls[0].body.sql, "SELECT * FROM cascade WHERE id = 'f48063a4-d4d7-5a0b-93bf-da87cc126940'");
});

test("alertImpact composes resource SQL", async () => {
  const { gx, calls } = capturing();
  await gx.alertImpact({ resource: "gke-prod-1-node-x" });
  assert.equal(calls[0].body.sql, "SELECT * FROM alert_impact WHERE resource = 'gke-prod-1-node-x'");
});

test("monitor composes target SQL", async () => {
  const { gx, calls } = capturing();
  await gx.monitor({ target: "user-locations-broker" });
  assert.equal(calls[0].body.sql, "SELECT * FROM monitor WHERE target = 'user-locations-broker'");
});

test("datastore composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.datastore();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM datastore");
  const t = capturing();
  await t.gx.datastore({ target: "mariadb-billing", limit: 5 });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM datastore WHERE target = 'mariadb-billing' LIMIT 5");
});

test("flow composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.flow();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM flow");
  const t = capturing();
  await t.gx.flow({ target: "gillbus-update-geography" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM flow WHERE target = 'gillbus-update-geography'");
});

test("externalDep composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.externalDep();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM external_dep");
  const t = capturing();
  await t.gx.externalDep({ target: "nexmo.com" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM external_dep WHERE target = 'nexmo.com'");
});

test("alerts composes all and target SQL", async () => {
  const a = capturing();
  await a.gx.alerts();
  assert.equal(a.calls[0].body.sql, "SELECT * FROM alerts");
  const t = capturing();
  await t.gx.alerts({ target: "payment", limit: 20 });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM alerts WHERE target = 'payment' LIMIT 20");
});

test("alertNoise composes ranked, kind-filtered, and scoped SQL", async () => {
  const r = capturing();
  await r.gx.alertNoise();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM alert_noise");
  const k = capturing();
  await k.gx.alertNoise({ kind: "flapping", since: "1d", limit: 10 });
  assert.equal(k.calls[0].body.sql, "SELECT * FROM alert_noise WHERE kind = 'flapping' AND since = '1d' LIMIT 10");
  const t = capturing();
  await t.gx.alertNoise({ target: "payment-servix" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM alert_noise WHERE target = 'payment-servix'");
});

test("calls composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.calls();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM calls");
  const t = capturing();
  await t.gx.calls({ target: "feature-flags" });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM calls WHERE target = 'feature-flags'");
});

test("slo composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.slo();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM slo");
  const t = capturing();
  await t.gx.slo({ target: "checkout availability", limit: 5 });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM slo WHERE target = 'checkout availability' LIMIT 5");
});

test("serviceTree composes ranked and target SQL", async () => {
  const r = capturing();
  await r.gx.serviceTree();
  assert.equal(r.calls[0].body.sql, "SELECT * FROM servicetree");
  const t = capturing();
  await t.gx.serviceTree({ target: "payment", limit: 5 });
  assert.equal(t.calls[0].body.sql, "SELECT * FROM servicetree WHERE target = 'payment' LIMIT 5");
});

test("alertCause composes target + since SQL", async () => {
  const { gx, calls } = capturing();
  await gx.alertCause({ target: "payout-servix", since: "6h" });
  assert.equal(calls[0].body.sql, "SELECT * FROM alert_cause WHERE target = 'payout-servix' AND since = '6h'");
});

test("no filters yields a bare SELECT", async () => {
  const { gx, calls } = capturing();
  await gx.failures();
  assert.equal(calls[0].body.sql, "SELECT * FROM failures");
});

test("client posts to the /v1 path", async () => {
  const { gx, calls } = capturing();
  await gx.failures({ namespace: "payment" });
  assert.equal(calls[0].path, "/v1/query");
});

test("offset composes a trailing OFFSET clause", async () => {
  const { gx, calls } = capturing();
  await gx.events({ type: "oom", limit: 50, offset: 100 });
  assert.equal(calls[0].body.sql, "SELECT * FROM events WHERE type = 'oom' LIMIT 50 OFFSET 100");
});

test("topology composes service + level SQL", async () => {
  const a = capturing();
  await a.gx.topology({ service: "busfor-worker", level: "container" });
  assert.equal(a.calls[0].body.sql, "SELECT * FROM topology WHERE service = 'busfor-worker' AND level = 'container'");
  const b = capturing();
  await b.gx.topology({ service: "payment" });
  assert.equal(b.calls[0].body.sql, "SELECT * FROM topology WHERE service = 'payment'");
});
