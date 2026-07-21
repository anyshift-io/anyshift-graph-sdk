# Anyshift Graph Query Language

This is the complete reference for deterministic queries accepted by the Anyshift Graph API and `annie graph query`. It is generated from the executable query catalog published in the Graph API OpenAPI contract.

## Grammar

```text
SELECT <*|count(*)> FROM <table> [WHERE k = v [AND ...]] [LIMIT n] [OFFSET n]
```

Supported selectors: `*`, `count(*)`. Accepted selector aliases: `count(1)`.

Values may be bare words or single- or double-quoted strings.

`LIMIT` and `OFFSET` are written after the optional `WHERE` clause. Each target below states whether the modifier is applied by that query.

## Query Targets

| Target | Purpose | Filters |
| --- | --- | --- |
| [`resolve`](#resolve) | Resolve a resource name or fragment to ranked current graph resources. | `term` |
| [`events`](#events) | Read the infrastructure change-event timeline. | `type`, `target`, `namespace`, `noise`, `since` |
| [`resources`](#resources) | Count and sample current resources of one graph resource type. | `type` |
| [`connections`](#connections) | Inspect direct upstream and downstream relationships for a resource. | `resource` |
| [`hotspots`](#hotspots) | Rank noisy resources, namespaces, alert rules, or alerting workloads. | `type`, `by`, `namespace`, `noise`, `since` |
| [`incidents`](#incidents) | Reconstruct a correlated incident around a target or correlation identifier. | `target`, `id`, `type` |
| [`failures`](#failures) | Read recent failure-class infrastructure events. | `target`, `namespace`, `since` |
| [`deployments`](#deployments) | Read recent workload deployments and image changes. | `target`, `namespace`, `since` |
| [`audit`](#audit) | Read configuration, identity, and infrastructure audit events. | `target`, `namespace`, `type`, `since` |
| [`nodes`](#nodes) | Read node lifecycle and capacity events. | `target`, `since` |
| [`deploy_impact`](#deploy-impact) | Join recent deployments to the failures that followed them. | `target`, `since` |
| [`common_cause`](#common-cause) | Find shared infrastructure or dependencies behind recent failures. | `namespace`, `since` |
| [`blast_radius`](#blast-radius) | Calculate the transitive workloads, pods, and services affected by a resource. | `resource` |
| [`spof`](#spof) | Rank highly shared ConfigMaps, service accounts, or nodes by fan-in. | `kind`, `namespace` |
| [`orphans`](#orphans) | Find unused or dangling Kubernetes resources. | `kind`, `namespace` |
| [`coverage`](#coverage) | Find service, monitor, or metrics coverage gaps. | `kind`, `namespace` |
| [`access`](#access) | Inspect RBAC reach or rank over-privileged service accounts. | `resource`, `mode` |
| [`exposure`](#exposure) | Trace public ingress exposure to or from a resource. | `resource` |
| [`tenancy`](#tenancy) | Find workloads co-located with a resource on the same node. | `resource` |
| [`sharedconfig`](#sharedconfig) | Find workloads coupled through shared configuration. | `resource` |
| [`path`](#path) | Find the shortest structural path between two resources. | `from`, `to` |
| [`cascade`](#cascade) | Trace an incident correlation group in propagation order. | `target`, `id` |
| [`alert_impact`](#alert-impact) | Find monitors and SLOs affected by a resource failure. | `resource` |
| [`monitor`](#monitor) | Resolve a monitor to the infrastructure it observes. | `target` |
| [`datastore`](#datastore) | Inspect datastore dependencies or rank widely used datastores. | `target` |
| [`flow`](#flow) | Inspect stream producers and consumers or rank busy streams. | `target` |
| [`external_dep`](#external-dep) | Inspect external dependencies or rank high-fan-in external hosts. | `target` |
| [`alerts`](#alerts) | List currently firing monitors, optionally scoped to a service. | `target` |
| [`alert_noise`](#alert-noise) | Rank flapping or stuck monitors. | `target`, `kind`, `since` |
| [`calls`](#calls) | Inspect service callers and callees or rank call-graph fan-in. | `target` |
| [`servicetree`](#servicetree) | Expand a service's downstream services, datastores, and external dependencies. | `target` |
| [`alert_cause`](#alert-cause) | Join a firing service or workload to recent Kubernetes changes. | `target`, `since` |
| [`slo`](#slo) | Inspect one SLO or rank breaching and at-risk SLOs. | `target` |
| [`alertrules`](#alertrules) | Inspect Grafana and VictoriaMetrics alert-rule coverage and inventory. | `subject`, `namespace`, `target` |
| [`gitops`](#gitops) | Inspect GitOps drift, unmanaged workloads, or resource ownership. | `subject`, `namespace`, `resource` |
| [`image`](#image) | Inspect image usage, workload containers, or container hygiene gaps. | `target`, `workload`, `kind`, `namespace` |
| [`netpol`](#netpol) | Inspect NetworkPolicy coverage, policies, or east-west reach. | `mode`, `namespace`, `target` |
| [`priority`](#priority) | Inspect scheduling priority gaps, the class ladder, or one target's priority. | `kind`, `namespace`, `target` |
| [`storage`](#storage) | Inspect workload storage and find orphaned or unclaimed volumes. | `mode`, `workload`, `resource`, `class`, `namespace` |
| [`pdb`](#pdb) | Find workloads without PodDisruptionBudgets or inspect one workload or PDB. | `target`, `workload`, `pdb` |
| [`scaling`](#scaling) | Find workloads without HPAs, list autoscaled workloads, or inspect one target. | `mode`, `namespace`, `target` |
| [`topology`](#topology) | Build a typed service topology at a selected level. | `service`, `level` |

## resolve

Resolve a resource name or fragment to ranked current graph resources.

Result intent: `resolve`.

Table aliases: `search`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `term` | string | Yes | Any value | Resource name or fragment to resolve. |

### Forms

#### Resolve resources

Return ranked candidates for a resource name or fragment.

```console
$ annie graph query "SELECT * FROM resolve WHERE term = checkout LIMIT 10"
```

## events

Read the infrastructure change-event timeline.

Result intent: `events`.

Table aliases: `event`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `type` | string | No | Any value | Event type or type fragment, such as oom or scaling. |
| `target` | string | No | Any value | Resource name or fragment. |
| `namespace` | string | No | Any value | Kubernetes namespace. |
| `noise` | enum | No | `signal` (`false`, `exclude`)<br />`all` (`true`, `include`) | Whether to include noisy events. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Recent resource events

Read recent events for a resource inside a time window.

```console
$ annie graph query "SELECT * FROM events WHERE target = checkout AND since = 2h LIMIT 20"
```

## resources

Count and sample current resources of one graph resource type.

Result intent: `inventory`.

Table aliases: `resource`, `inventory`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `type` | string | Yes | Any value | Graph resource type, such as service or deployment. |

### Forms

#### Resource inventory

Return the inventory for one resource type.

```console
$ annie graph query "SELECT * FROM resources WHERE type = deployment LIMIT 50"
```

## connections

Inspect direct upstream and downstream relationships for a resource.

Result intent: `connections`.

Table aliases: `connection`, `deps`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Resource name or identifier. |

### Forms

#### Direct connections

Return the resource and its direct graph neighbors.

```console
$ annie graph query "SELECT * FROM connections WHERE resource = checkout LIMIT 50"
```

## hotspots

Rank noisy resources, namespaces, alert rules, or alerting workloads.

Result intent: `hotspots`.

Table aliases: `hotspot`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `type` | string | No | Any value | Event type or type fragment. |
| `by` | enum | No | `resource` (`resources`)<br />`namespace` (`namespaces`, `ns`)<br />`alertrule` (`alertrules`, `rule`)<br />`alertworkload` (`alertworkloads`, `workload`) | Ranking dimension. |
| `namespace` | string | No | Any value | Kubernetes namespace scope. |
| `noise` | enum | No | `signal` (`false`, `exclude`)<br />`all` (`true`, `include`) | Whether to include noisy events. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Resource hotspots

Rank resources by recent event activity.

```console
$ annie graph query "SELECT * FROM hotspots WHERE by = resource AND since = 24h LIMIT 10"
```

## incidents

Reconstruct a correlated incident around a target or correlation identifier.

Result intent: `incident`.

Table aliases: `incident`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Resource name or fragment. |
| `id` | string | No | Any value | Correlation identifier. |
| `type` | string | No | Any value | Optional event type filter. |

### Forms

#### Incident by target

At least one of target or id is required.

```console
$ annie graph query "SELECT * FROM incidents WHERE target = checkout"
```

#### Incident by correlation id

Load one exact correlation group.

```console
$ annie graph query "SELECT * FROM incidents WHERE id = incident-123"
```

## failures

Read recent failure-class infrastructure events.

Result intent: `failures`.

Table aliases: None.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Resource name or fragment. |
| `namespace` | string | No | Any value | Kubernetes namespace. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Recent failures

Read failures for a target, namespace, or the whole project.

```console
$ annie graph query "SELECT * FROM failures WHERE namespace = commerce AND since = 2h LIMIT 20"
```

## deployments

Read recent workload deployments and image changes.

Result intent: `deployments`.

Table aliases: `deployment`, `rollouts`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Workload name or fragment. |
| `namespace` | string | No | Any value | Kubernetes namespace. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Recent deployments

Read deployments for a target, namespace, or the whole project.

```console
$ annie graph query "SELECT * FROM deployments WHERE namespace = commerce AND since = 24h LIMIT 20"
```

## audit

Read configuration, identity, and infrastructure audit events.

Result intent: `audit`.

Table aliases: `changes`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Resource name or fragment. |
| `namespace` | string | No | Any value | Kubernetes namespace. |
| `type` | string | No | Any value | Audit event type or fragment, such as rbac. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### RBAC audit

Read recent RBAC-related changes.

```console
$ annie graph query "SELECT * FROM audit WHERE type = rbac AND since = 24h LIMIT 20"
```

## nodes

Read node lifecycle and capacity events.

Result intent: `nodes`.

Table aliases: `node`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Node name or fragment. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Node activity

Read recent node events.

```console
$ annie graph query "SELECT * FROM nodes WHERE since = 6h LIMIT 20"
```

## deploy_impact

Join recent deployments to the failures that followed them.

Result intent: `deployimpact`.

Table aliases: `impact`, `risky`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Workload name or fragment. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Deployment impact

Rank recent deployment fallout or inspect one workload.

```console
$ annie graph query "SELECT * FROM deploy_impact WHERE target = checkout AND since = 24h LIMIT 10"
```

## common_cause

Find shared infrastructure or dependencies behind recent failures.

Result intent: `commoncause`.

Table aliases: `commoncause`, `cause`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `namespace` | string | No | Any value | Kubernetes namespace scope. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Shared failure causes

Intersect recent failures by node, workload, datastore, and external dependency.

```console
$ annie graph query "SELECT * FROM common_cause WHERE namespace = commerce AND since = 2h LIMIT 10"
```

## blast_radius

Calculate the transitive workloads, pods, and services affected by a resource.

Result intent: `blast`.

Table aliases: `blast`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Starting resource name or identifier. |

### Forms

#### Resource blast radius

Walk impact outward from one resource.

```console
$ annie graph query "SELECT * FROM blast_radius WHERE resource = shared-runtime-sa LIMIT 100"
```

## spof

Rank highly shared ConfigMaps, service accounts, or nodes by fan-in.

Result intent: `spof`.

Table aliases: `spofs`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `kind` | enum | No | `configmap` (`configmaps`, `cm`)<br />`serviceaccount` (`serviceaccounts`, `sa`)<br />`node` (`nodes`) | Resource kind to rank. Defaults to configmap. |
| `namespace` | string | No | Any value | Kubernetes namespace scope. |

### Forms

#### Shared service accounts

Rank service accounts by dependent workloads and pods.

```console
$ annie graph query "SELECT * FROM spof WHERE kind = serviceaccount LIMIT 10"
```

## orphans

Find unused or dangling Kubernetes resources.

Result intent: `orphans`.

Table aliases: `orphan`, `unused`, `dangling`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `kind` | enum | No | `configmap` (`configmaps`, `cm`)<br />`serviceaccount` (`serviceaccounts`, `sa`)<br />`role` (`roles`)<br />`replicaset` (`replicasets`, `rs`) | Resource kind to inspect. Defaults to configmap. |
| `namespace` | string | No | Any value | Kubernetes namespace scope. |

### Forms

#### Orphaned roles

Find roles with no observed consumers.

```console
$ annie graph query "SELECT * FROM orphans WHERE kind = role AND namespace = commerce LIMIT 20"
```

## coverage

Find service, monitor, or metrics coverage gaps.

Result intent: `coverage`.

Table aliases: `blindspots`, `unmonitored`, `uncovered`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `kind` | enum | No | `service` (`services`, `workload`, `workloads`)<br />`monitor` (`monitors`)<br />`metrics` (`metric`) | Coverage dimension. Defaults to service. |
| `namespace` | string | No | Any value | Kubernetes namespace scope. |

### Forms

#### Monitoring gaps

Find unmonitored services in one namespace.

```console
$ annie graph query "SELECT * FROM coverage WHERE kind = service AND namespace = commerce LIMIT 20"
```

## access

Inspect RBAC reach or rank over-privileged service accounts.

Result intent: `access`.

Table aliases: `rbac`, `permissions`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | No | Any value | Subject or role name in reach mode; optional namespace scope in privileged mode. |
| `mode` | enum | No | `reach`<br />`privileged` | Access analysis mode. Defaults to reach. |

### Forms

#### Subject reach

Reach mode requires resource.

```console
$ annie graph query "SELECT * FROM access WHERE resource = ci-deployer"
```

#### Privileged identities

Privileged mode can optionally scope resource to a namespace.

```console
$ annie graph query "SELECT * FROM access WHERE mode = privileged LIMIT 10"
```

## exposure

Trace public ingress exposure to or from a resource.

Result intent: `exposure`.

Table aliases: `exposed`, `attack_surface`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Ingress, service, or workload name. |

### Forms

#### Public exposure

Trace how a resource is publicly exposed.

```console
$ annie graph query "SELECT * FROM exposure WHERE resource = checkout"
```

## tenancy

Find workloads co-located with a resource on the same node.

Result intent: `tenancy`.

Table aliases: `colocation`, `colocated`, `neighbors`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Workload, pod, or node name. |

### Forms

#### Noisy neighbors

Inspect resources sharing a node with the target.

```console
$ annie graph query "SELECT * FROM tenancy WHERE resource = checkout LIMIT 20"
```

## sharedconfig

Find workloads coupled through shared configuration.

Result intent: `sharedconfig`.

Table aliases: `shared_config`, `configsiblings`, `config_siblings`, `configcoupled`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Workload or configuration resource name. |

### Forms

#### Shared configuration

Find workloads sharing configuration with the target.

```console
$ annie graph query "SELECT * FROM sharedconfig WHERE resource = checkout LIMIT 20"
```

## path

Find the shortest structural path between two resources.

Result intent: `path`.

Table aliases: `paths`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `from` | string | Yes | Any value | Starting resource name. |
| `to` | string | Yes | Any value | Destination resource name. |

### Forms

#### Shortest path

Both from and to are required.

```console
$ annie graph query "SELECT * FROM path WHERE from = checkout AND to = checkout-postgres"
```

## cascade

Trace an incident correlation group in propagation order.

Result intent: `cascade`.

Table aliases: `cascades`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Resource name or fragment. |
| `id` | string | No | Any value | Correlation identifier. |

### Forms

#### Cascade by target

At least one of target or id is required.

```console
$ annie graph query "SELECT * FROM cascade WHERE target = checkout"
```

#### Cascade by correlation id

Trace one exact correlation group.

```console
$ annie graph query "SELECT * FROM cascade WHERE id = incident-123"
```

## alert_impact

Find monitors and SLOs affected by a resource failure.

Result intent: `alertimpact`.

Table aliases: `alertimpact`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Infrastructure resource name. |

### Forms

#### Alert impact

Map an infrastructure resource to affected observability objects.

```console
$ annie graph query "SELECT * FROM alert_impact WHERE resource = checkout"
```

## monitor

Resolve a monitor to the infrastructure it observes.

Result intent: `monitor`.

Table aliases: `monitors`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | Yes | Any value | Monitor name or fragment. |

### Forms

#### Monitor infrastructure

Map one monitor to its service, workload, and node.

```console
$ annie graph query "SELECT * FROM monitor WHERE target = checkout-latency"
```

## datastore

Inspect datastore dependencies or rank widely used datastores.

Result intent: `datastore`.

Table aliases: `datastores`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Service or datastore name. |

### Forms

#### Rank datastores

Omit target to rank datastore fan-in.

```console
$ annie graph query "SELECT * FROM datastore LIMIT 10"
```

#### Datastore dependencies

Inspect services connected to one datastore or datastores used by one service.

```console
$ annie graph query "SELECT * FROM datastore WHERE target = checkout-postgres"
```

## flow

Inspect stream producers and consumers or rank busy streams.

Result intent: `flow`.

Table aliases: `flows`, `stream`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Service, topic, queue, or stream name. |

### Forms

#### Stream dependencies

Inspect producers and consumers for a stream.

```console
$ annie graph query "SELECT * FROM flow WHERE target = checkout-events"
```

## external_dep

Inspect external dependencies or rank high-fan-in external hosts.

Result intent: `externaldep`.

Table aliases: `externaldep`, `external`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Service or external dependency name. |

### Forms

#### External dependencies

Inspect services depending on one external host.

```console
$ annie graph query "SELECT * FROM external_dep WHERE target = payments.example.com"
```

## alerts

List currently firing monitors, optionally scoped to a service.

Result intent: `alerts`.

Table aliases: `alert`, `firing`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Service or workload name. |

### Forms

#### Current alerts

List firing monitors for the project or one target.

```console
$ annie graph query "SELECT * FROM alerts WHERE target = checkout LIMIT 20"
```

## alert_noise

Rank flapping or stuck monitors.

Result intent: `alertnoise`.

Table aliases: `alertnoise`, `noise`, `flapping`, `noisy`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Monitor or service name. |
| `kind` | enum | No | `flapping` (`flap`)<br />`stuck` | Noise pattern. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Flapping alerts

Rank recently flapping monitors.

```console
$ annie graph query "SELECT * FROM alert_noise WHERE kind = flapping AND since = 1d LIMIT 10"
```

## calls

Inspect service callers and callees or rank call-graph fan-in.

Result intent: `calls`.

Table aliases: `call`, `callgraph`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Service name. |

### Forms

#### Service calls

Inspect callers and callees for one service.

```console
$ annie graph query "SELECT * FROM calls WHERE target = checkout"
```

## servicetree

Expand a service's downstream services, datastores, and external dependencies.

Result intent: `servicetree`.

Table aliases: `service_tree`, `footprint`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Root service name. |

### Forms

#### Service tree

Expand the downstream footprint of one service.

```console
$ annie graph query "SELECT * FROM servicetree WHERE target = checkout LIMIT 50"
```

## alert_cause

Join a firing service or workload to recent Kubernetes changes.

Result intent: `alertcause`.

Table aliases: `alertcause`, `rootcause`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | Yes | Any value | Service or workload name. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Alert cause

Find recent infrastructure changes behind a firing target.

```console
$ annie graph query "SELECT * FROM alert_cause WHERE target = checkout AND since = 2h LIMIT 20"
```

## slo

Inspect one SLO or rank breaching and at-risk SLOs.

Result intent: `slo`.

Table aliases: `slos`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | SLO name or fragment. |

### Forms

#### SLO health

Inspect one SLO by name.

```console
$ annie graph query "SELECT * FROM slo WHERE target = 'checkout availability'"
```

## alertrules

Inspect Grafana and VictoriaMetrics alert-rule coverage and inventory.

Result intent: `alertrules`.

Table aliases: `alert_rules`, `grafana`, `victoria`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `subject` | enum | No | `coverage`<br />`inventory` (`inventories`)<br />`target` (`targets`) | Alert-rule view. Defaults to coverage. |
| `namespace` | string | No | Any value | Namespace scope for coverage or inventory. |
| `target` | string | No | Any value | Service or workload name. Required when subject is target. |

### Forms

#### Alert-rule coverage

Find services or workloads without alert rules.

```console
$ annie graph query "SELECT * FROM alertrules WHERE subject = coverage AND namespace = commerce LIMIT 20"
```

#### Rules for a target

Target subject requires target.

```console
$ annie graph query "SELECT * FROM alertrules WHERE subject = target AND target = checkout"
```

## gitops

Inspect GitOps drift, unmanaged workloads, or resource ownership.

Result intent: `gitops`.

Table aliases: `argocd`, `drift`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `subject` | enum | No | `drift` (`drifted`)<br />`unmanaged`<br />`owner` (`ownership`) | GitOps view. Defaults to drift. |
| `namespace` | string | No | Any value | Namespace scope for drift or unmanaged views. |
| `resource` | string | No | Any value | Workload name. Required when subject is owner. |

### Forms

#### GitOps drift

List drifted applications, optionally scoped to a namespace.

```console
$ annie graph query "SELECT * FROM gitops WHERE subject = drift AND namespace = commerce LIMIT 20"
```

#### Resource owner

Owner subject requires resource.

```console
$ annie graph query "SELECT * FROM gitops WHERE subject = owner AND resource = checkout"
```

## image

Inspect image usage, workload containers, or container hygiene gaps.

Result intent: `image`.

Table aliases: `images`, `containers`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Image, service, or workload name. |
| `workload` | string | No | Any value | Workload whose container resources should be inspected. |
| `kind` | enum | No | `nomemlimit` (`no_mem_limit`, `nomemorylimit`)<br />`nocpurequest` (`no_cpu_request`)<br />`skew` (`versionskew`, `version_skew`) | Container hygiene scan. |
| `namespace` | string | No | Any value | Namespace scope for a hygiene scan. |

### Forms

#### Image usage

Inspect who runs an image or what image a target runs.

```console
$ annie graph query "SELECT * FROM image WHERE target = checkout"
```

#### Container hygiene

Kind selects a hygiene scan and namespace optionally scopes it.

```console
$ annie graph query "SELECT * FROM image WHERE kind = nomemlimit AND namespace = commerce LIMIT 20"
```

## netpol

Inspect NetworkPolicy coverage, policies, or east-west reach.

Result intent: `netpol`.

Table aliases: `netpols`, `networkpolicy`, `segmentation`, `defaultallow`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `mode` | enum | No | `uncovered` (`coverage`, `default_allow`, `defaultallow`)<br />`policy` (`policies`)<br />`segmentation` (`segment`) | Network policy view. Defaults to uncovered. |
| `namespace` | string | No | Any value | Namespace scope for uncovered or policy views. |
| `target` | string | No | Any value | Workload or policy name. Required for segmentation. |

### Forms

#### NetworkPolicy gaps

Find default-allow namespaces.

```console
$ annie graph query "SELECT * FROM netpol WHERE mode = uncovered LIMIT 20"
```

#### East-west reach

Segmentation mode requires target.

```console
$ annie graph query "SELECT * FROM netpol WHERE mode = segmentation AND target = checkout"
```

## priority

Inspect scheduling priority gaps, the class ladder, or one target's priority.

Result intent: `priority`.

Table aliases: `priorityclass`, `preemption`, `nopriority`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `kind` | enum | No | `nopriority` (`unprioritized`, `none`)<br />`ladder` (`classes`, `class`) | Priority view. |
| `namespace` | string | No | Any value | Namespace scope for missing-priority checks. |
| `target` | string | No | Any value | Workload or pod name whose priority should be inspected. |

### Forms

#### Missing priority classes

Find workloads without a priority class.

```console
$ annie graph query "SELECT * FROM priority WHERE kind = nopriority AND namespace = commerce LIMIT 20"
```

#### Target priority

Inspect the priority class for one workload or pod.

```console
$ annie graph query "SELECT * FROM priority WHERE target = checkout"
```

## storage

Inspect workload storage and find orphaned or unclaimed volumes.

Result intent: `storage`.

Table aliases: `volumes`, `pv`, `pvc`, `storageclass`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `mode` | enum | No | `footprint` (`workload`)<br />`orphanpv` (`orphanpvs`, `orphaned`, `orphan`)<br />`unclaimedpvc` (`unclaimedpvcs`, `unclaimed`)<br />`byclass` (`class`, `storageclass`) | Storage view. Defaults to footprint. |
| `workload` | string | No | Any value | Workload or pod name. Required in footprint mode. |
| `resource` | string | No | Any value | Alias for workload in footprint mode. |
| `class` | string | No | Any value | StorageClass filter for orphanpv or byclass mode. |
| `namespace` | string | No | Any value | Namespace scope for unclaimedpvc mode. |

### Forms

#### Workload storage

Footprint mode requires workload or resource.

```console
$ annie graph query "SELECT * FROM storage WHERE workload = checkout"
```

#### Unclaimed PVCs

Find unclaimed claims, optionally scoped to a namespace.

```console
$ annie graph query "SELECT * FROM storage WHERE mode = unclaimedpvc AND namespace = commerce LIMIT 20"
```

## pdb

Find workloads without PodDisruptionBudgets or inspect one workload or PDB.

Result intent: `pdb`.

Table aliases: `pdbs`, `unprotected`, `disruption`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Workload or PDB name. |
| `workload` | string | No | Any value | Workload name. |
| `pdb` | string | No | Any value | PodDisruptionBudget name. |

### Forms

#### PDB coverage gaps

Omit filters to list workloads without PDB protection.

```console
$ annie graph query "SELECT * FROM pdb LIMIT 20"
```

#### Target PDB coverage

Inspect one workload or PDB by target, workload, or pdb.

```console
$ annie graph query "SELECT * FROM pdb WHERE workload = checkout"
```

## scaling

Find workloads without HPAs, list autoscaled workloads, or inspect one target.

Result intent: `scaling`.

Table aliases: `hpa`, `hpas`, `autoscaling`, `autoscalers`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `mode` | enum | No | `nohpa` (`no_hpa`, `unscaled`, `fixed`, `coverage`)<br />`autoscaled` (`hpa`, `scaled`)<br />`target` | Autoscaling view. Defaults to nohpa. |
| `namespace` | string | No | Any value | Namespace scope for nohpa or autoscaled views. |
| `target` | string | No | Any value | Workload or HPA name. Required in target mode. |

### Forms

#### Autoscaling gaps

Find workloads without HPAs.

```console
$ annie graph query "SELECT * FROM scaling WHERE mode = nohpa AND namespace = commerce LIMIT 20"
```

#### Target autoscaling

Target mode requires target.

```console
$ annie graph query "SELECT * FROM scaling WHERE target = checkout"
```

## topology

Build a typed service topology at a selected level.

Result intent: `topology`.

Table aliases: `diagram`, `c4`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `service` | string | Yes | Any value | Service or workload name. |
| `level` | enum | No | `context`<br />`container`<br />`component`<br />`dynamic` | Topology level. Defaults to container. |

### Forms

#### Service topology

Service is required; level selects the topology depth.

```console
$ annie graph query "SELECT * FROM topology WHERE service = checkout AND level = context"
```

## Related Documentation

- [Annie CLI](https://docs.anyshift.io/pages/product/integration/cli)
- [Graph SDK](https://docs.anyshift.io/pages/product/integration/sdk)
- [Graph SDK capabilities](./CAPABILITIES.md)
- [OpenAPI contract](./openapi/graph-api.v1.json)

