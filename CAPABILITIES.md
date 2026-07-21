# Anyshift Graph API Capabilities

This file is the canonical capability matrix for the public Anyshift Graph SDKs. It describes
what a developer can build with the Graph API, which TypeScript helper to call, the underlying
graph query target, and the main parameters to use.

The TypeScript SDK also exposes two escape hatches:

- `graph.query(sql)` sends deterministic Anyshift graph SQL to `/v1/query`.
- `graph.ask(question)` sends a natural-language graph question to `/v1/ask`.

Use the generated [Graph Query Language reference](./QUERY_LANGUAGE.md) to discover every
deterministic query target, filter, accepted value, alias, and valid form.

All typed helpers call `graph.query(...)` and return an `AskResult` envelope with:

- `intent`: the resolved Graph API intent.
- `summary`: a human-readable answer.
- intent-specific payload fields, such as `events`, `connections`, `nodes`, `edges`, or
  `topology`.

## Operational Timeline

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| Recent events | `graph.events()` | `events` | What changed recently for a resource, namespace, or event type. |
| Event hotspots | `graph.hotspots()` | `hotspots` | Which resources, namespaces, alert rules, or alerting workloads are currently noisy. |
| Correlated incident | `graph.incident({ target })` or `graph.incident({ id })` | `incidents` | Which root event caused an incident and how the correlated event chain unfolded. |
| Failure feed | `graph.failures()` | `failures` | Which recent failure events affect a target or namespace. |
| Deployments | `graph.deployments()` | `deployments` | Which rollout events happened recently, optionally scoped to a target or namespace. |
| Audit changes | `graph.audit()` | `audit` | Which configuration or identity changes happened recently. |
| Node activity | `graph.nodes()` | `nodes` | Which node lifecycle or scheduling events happened recently. |
| Incident cascade | `graph.cascade()` | `cascade` | How an incident propagated over time for a target or correlation id. |

Common parameters:

- `since`: time window such as `"30m"`, `"1h"`, `"6h"`, `"1d"`, or `"today"`.
- `target`: service, workload, monitor, or resource name depending on the helper.
- `namespace`: Kubernetes namespace substring.
- `limit` and `offset`: pagination controls where supported.

## Dependency And Impact Analysis

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| Resource resolution | `graph.resolve({ term })` | `resolve` | Which current resources best match a name or fragment before opening a drill-down. |
| Direct connections | `graph.connections({ resource })` | `connections` | What is directly connected to a resource. |
| Inventory | `graph.inventory({ type })` | `resources` | Which resources of a type exist in the graph. |
| Blast radius | `graph.blast({ resource })` | `blast_radius` | Which workloads and services are affected if a resource changes or fails. |
| Dependency path | `graph.path({ from, to })` | `path` | How two resources are structurally connected. |
| Downstream footprint | `graph.serviceTree()` | `servicetree` | A service's transitive downstream services and infrastructure leaves. |
| Common cause | `graph.commonCause()` | `common_cause` | Which shared node, workload, datastore, or external dependency may explain recent failures. |
| Deploy impact | `graph.deployImpact()` | `deploy_impact` | Whether a rollout caused fallout, ranked or scoped to one workload. |
| Shared config | `graph.sharedConfig({ resource })` | `sharedconfig` | Which workloads are coupled through the same ConfigMap. |
| Tenancy | `graph.tenancy({ resource })` | `tenancy` | Which workloads are co-located on the same node. |

## Topology And Diagrams

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| Service topology | `graph.topology({ service, level })` | `topology` | Get a typed `{ nodes, edges }` graph for a service neighborhood. |
| Mermaid rendering | `toMermaid(result)` | n/a | Convert a topology result into Mermaid text for reports, PRs, and runbooks. |

Topology levels:

- `context`: service and direct collaborators.
- `container`: runtime containers, workloads, datastores, queues, and external dependencies.
- `component`: deeper component/config roll-down.
- `dynamic`: ordered call flow rendered as a Mermaid sequence diagram.

## Kubernetes Safety And Hygiene

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| Single points of failure | `graph.spof()` | `spof` | Which ConfigMaps, service accounts, or nodes have the highest fan-in. |
| Orphaned resources | `graph.orphans()` | `orphans` | Which ConfigMaps, service accounts, roles, or ReplicaSets are unused or dangling. |
| PodDisruptionBudget coverage | `graph.pdb()` | `pdb` | Which workloads lack PDB protection, or which PDB protects a target. |
| Autoscaler coverage | `graph.scaling()` | `scaling` | Which workloads have no HPA, which are autoscaled, or what an HPA targets. |
| Scheduling priority | `graph.priority()` | `priority` | Which workloads have no priority class, what the priority ladder is, or a target's priority. |
| Persistent storage | `graph.storage()` | `storage` | Which PVC/PV/StorageClass chain a workload uses, and which storage is orphaned or unclaimed. |
| Image inventory and hygiene | `graph.image()` | `image` | Who runs an image, what images a workload uses, or which containers miss resource controls. |

Selected modes:

- `spof({ kind })`: `configmap`, `serviceaccount`, or `node`.
- `orphans({ kind })`: `configmap`, `serviceaccount`, `role`, or `replicaset`.
- `scaling({ mode })`: `nohpa`, `autoscaled`, or `target`.
- `priority({ kind })`: `nopriority` or `ladder`; use `target` to inspect one workload or pod.
- `storage({ mode })`: `footprint`, `orphanpv`, `unclaimedpvc`, or `byclass`.
- `image({ kind })`: `nomemlimit`, `nocpurequest`, or `skew`.

## Security, Access, And Exposure

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| RBAC reach | `graph.access({ resource })` | `access` | What a service account, pod, workload, or role can reach. |
| Over-privileged identities | `graph.access({ mode: "privileged" })` | `access` | Which service accounts have broad or risky permissions. |
| NetworkPolicy coverage | `graph.netpol()` | `netpol` | Which namespaces are default-allow, which policies apply, or who can reach a target east-west. |
| Public exposure | `graph.exposure({ resource })` | `exposure` | What an ingress fronts, or which ingress fronts a service/workload. |

Selected modes:

- `access({ resource })`: follow effective RBAC from a workload, pod, service account, or role.
- `access({ mode: "privileged" })`: rank service accounts with broad or risky permissions.
- `netpol({ mode })`: `uncovered`, `policy`, or `segmentation`.

## Observability And Alerting

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| Observability coverage | `graph.coverage()` | `coverage` | Which workloads lack Datadog presence, monitors, or metrics shipping. |
| Datadog alert impact | `graph.alertImpact({ resource })` | `alert_impact` | Which monitors and SLOs would fire if a resource is impacted. |
| Monitor mapping | `graph.monitor({ target })` | `monitor` | Which service, workload, and node a monitor watches. |
| Active alerts | `graph.alerts()` | `alerts` | Which Datadog monitors are currently firing, optionally scoped to a target. |
| Alert noise | `graph.alertNoise()` | `alert_noise` | Which monitors are flapping or stuck. |
| Alert cause | `graph.alertCause({ target })` | `alert_cause` | Which recent Kubernetes change likely caused a firing alert. |
| SLO health | `graph.slo()` | `slo` | Which SLOs are breaching or at risk, or the status of one SLO. |
| Grafana/Victoria alert rules | `graph.alertRules()` | `alertrules` | Which workloads lack rules, which rules exist, or which rules cover a target. |

Selected modes:

- `coverage({ kind })`: `service`, `monitor`, or `metrics`.
- `alertNoise({ kind })`: `flapping` or `stuck`.
- `alertRules({ subject })`: `coverage`, `inventory`, or `target`.

## Service Dependencies

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| Datastore dependencies | `graph.datastore()` | `datastore` | Which services use a datastore, or the ranked most-used datastores. |
| Stream dependencies | `graph.flow()` | `flow` | Which services produce to or consume from a topic/stream. |
| External dependencies | `graph.externalDep()` | `external_dep` | Which services depend on an external host, or the ranked external hosts. |
| Service calls | `graph.calls()` | `calls` | A service's callers and callees, or the ranked most-called services. |

Each helper supports `target` for a drill-down view and `limit` for ranked lists where applicable.

## GitOps And Ownership

| Capability | TypeScript helper | Graph query target | Use it to answer |
| --- | --- | --- | --- |
| GitOps drift | `graph.gitops()` | `gitops` | Which ArgoCD apps are drifted. |
| Unmanaged workloads | `graph.gitops({ subject: "unmanaged" })` | `gitops` | Which workloads are not managed by GitOps. |
| Workload ownership | `graph.gitops({ subject: "owner", resource })` | `gitops` | Which ArgoCD app, repository, or owner manages a workload. |

## Natural Language

Use `graph.ask(question)` when the caller has a human question rather than a specific query shape.
The server routes the question to one of the graph intents and returns the same `AskResult` envelope.

Use typed helpers or `graph.query(sql)` when you need deterministic behavior in automation, CI,
dashboards, or tests.

## Stability

The TypeScript SDK package is public and versioned as `@anyshift/graph-sdk`. The OpenAPI contract
snapshot in `openapi/graph-api.v1.json` is the compatibility boundary for SDK releases.

The capabilities above reflect the current public SDK surface. New SDKs for Python and Go should use
this matrix as the baseline for parity.
