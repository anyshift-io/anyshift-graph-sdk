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
| [`resource_details`](#resource_details) | Read one current graph resource by exact stable ID with safe properties and bounded relationships. | `id` |
| [`events`](#events) | Read the infrastructure change-event timeline. | `type`, `target`, `target_id`, `target_type`, `namespace`, `cluster`, `noise`, `stats`, `since`, `from`, `until`, `cursor` |
| [`cloud_events`](#cloud_events) | Read evidence-backed AWS, Azure, GCP, and Cloudflare change events without parsing summaries. | `provider`, `scope`, `region`, `category`, `type`, `resource`, `actor`, `correlation`, `operation`, `stats`, `noise`, `diff`, `since`, `cursor` |
| [`cloud_resources`](#cloud_resources) | Inspect current or recently deleted AWS, Azure, and GCP resources with freshness and provenance. | `provider`, `scope`, `region`, `type`, `resource`, `lifecycle`, `provenance`, `freshness`, `max_age`, `cursor` |
| [`delivery_events`](#delivery_events) | Read commit, CI, release, and deployment evidence from the delivery graph. | `stage`, `type`, `resource`, `actor`, `source`, `since`, `cursor` |
| [`provenance`](#provenance) | Trace a resource to stored release, commit, and actor evidence. | `resource` |
| [`ownership`](#ownership) | Resolve observed GitHub user or team code ownership and contact identities. | `resource` |
| [`graph_coverage`](#graph_coverage) | Inspect current node, relationship, bridge, and event evidence by graph source. | `source` |
| [`resources`](#resources) | Count and sample current resources of one graph resource type. | `type`, `source` |
| [`operational_impact`](#operational_impact) | Find potential operational impact through reviewed directional graph relationships. | `resource`, `depth` |
| [`connections`](#connections) | Inspect direct upstream and downstream relationships for a resource. | `resource` |
| [`hotspots`](#hotspots) | Rank noisy resources, namespaces, alert rules, or alerting workloads. | `type`, `by`, `namespace`, `noise`, `since` |
| [`correlations`](#correlations) | Reconstruct a correlated Anyshift event group around a target or correlation identifier. | `target`, `id`, `type`, `since` |
| [`incidents`](#incidents) | Deprecated alias for correlations. Reconstruct a correlated Anyshift event group around a target or correlation identifier. | `target`, `id`, `type`, `since` |
| [`failures`](#failures) | Read recent failure-class infrastructure events. | `target`, `namespace`, `since` |
| [`deployments`](#deployments) | Read recent workload deployments and image changes. | `target`, `namespace`, `since` |
| [`audit`](#audit) | Read configuration, identity, and infrastructure audit events. | `target`, `namespace`, `type`, `since` |
| [`nodes`](#nodes) | Read node lifecycle and capacity events. | `target`, `since` |
| [`deploy_impact`](#deploy_impact) | Join recent deployments to the failures that followed them. | `target`, `since` |
| [`common_cause`](#common_cause) | Find shared infrastructure or dependencies behind recent failures. | `namespace`, `since` |
| [`blast_radius`](#blast_radius) | Calculate the transitive workloads, pods, and services affected by a resource. | `resource` |
| [`spof`](#spof) | Rank highly shared ConfigMaps, service accounts, or nodes by fan-in. | `kind`, `namespace` |
| [`orphans`](#orphans) | Find unused or dangling Kubernetes resources. | `kind`, `namespace` |
| [`coverage`](#coverage) | Find service, monitor, or metrics coverage gaps. | `kind`, `namespace` |
| [`access`](#access) | Inspect RBAC reach or rank over-privileged service accounts. | `resource`, `mode` |
| [`exposure`](#exposure) | Trace bidirectional stored public-exposure routes and attached controls for one resource. | `resource`, `resource_id`, `resource_type`, `resource_namespace`, `resource_cluster`, `cursor` |
| [`tenancy`](#tenancy) | Find workloads co-located with a resource on the same node. | `resource` |
| [`sharedconfig`](#sharedconfig) | Find workloads coupled through shared configuration. | `resource` |
| [`path`](#path) | Find the shortest infrastructure or operational path between two resources; both scopes include reviewed Cloudflare traffic edges. | `from`, `from_exact`, `from_id`, `from_type`, `from_namespace`, `from_cluster`, `to`, `to_exact`, `to_id`, `to_type`, `to_namespace`, `to_cluster`, `scope` |
| [`cascade`](#cascade) | Trace an incident correlation group in propagation order. | `target`, `id`, `since` |
| [`alert_impact`](#alert_impact) | Find monitors and SLOs affected by a resource failure. | `resource` |
| [`monitor`](#monitor) | Resolve a monitor to the infrastructure it observes. | `target` |
| [`datastore`](#datastore) | Inspect datastore dependencies or rank widely used datastores. | `target`, `source` |
| [`flow`](#flow) | Inspect stream producers and consumers or rank busy streams. | `target`, `source` |
| [`external_dep`](#external_dep) | Inspect external dependencies or rank high-fan-in external hosts. | `target`, `source` |
| [`alerts`](#alerts) | List normalized operational alerts while retaining legacy Datadog firing-monitor fields. | `target`, `provider`, `status`, `severity`, `service_id`, `service`, `service_type`, `service_namespace`, `service_cluster`, `provider_service_id`, `since`, `from`, `to`, `at`, `cursor` |
| [`response_incidents`](#response_incidents) | List provider-neutral response incidents that coordinate alert handling. | `provider`, `status`, `service_id`, `service`, `service_type`, `service_namespace`, `service_cluster`, `provider_service_id`, `since`, `from`, `to`, `at`, `cursor`, `responder`, `urgency` |
| [`oncall`](#oncall) | List effective on-call responsibility for a point in time or bounded window. | `provider`, `status`, `service_id`, `service`, `service_type`, `service_namespace`, `service_cluster`, `provider_service_id`, `from`, `to`, `at`, `cursor`, `person`, `schedule` |
| [`incident_context`](#incident_context) | Group stored incident, alert, service, on-call, responder, and reviewed history hops without live provider calls. | `id`, `target`, `provider`, `since` |
| [`alert_noise`](#alert_noise) | Rank flapping or stuck monitors. | `target`, `kind`, `since` |
| [`calls`](#calls) | Inspect APM service callers, callees, and HTTP route evidence or rank call-graph fan-in. | `target`, `source` |
| [`servicetree`](#servicetree) | Expand a service's downstream services, datastores, and external dependencies. | `target`, `source` |
| [`alert_cause`](#alert_cause) | Join a firing service or workload to recent Kubernetes changes. | `target`, `since` |
| [`slo`](#slo) | Inspect one SLO or rank breaching and at-risk SLOs. | `target` |
| [`alertrules`](#alertrules) | Inspect Grafana and VictoriaMetrics alert-rule coverage and inventory. | `subject`, `namespace`, `target` |
| [`iac`](#iac) | Inspect Terraform code-to-state-to-cloud provenance and linkage coverage. | `resource`, `status`, `freshness` |
| [`iac_drift`](#iac_drift) | Compare last-applied Terraform state with fresh observed cloud properties. | `resource`, `status`, `freshness` |
| [`gitops`](#gitops) | Inspect GitOps drift, unmanaged workloads, or resource ownership. | `subject`, `namespace`, `resource` |
| [`image`](#image) | Inspect image usage, workload containers, or container hygiene gaps. | `target`, `workload`, `digest`, `kind`, `namespace` |
| [`netpol`](#netpol) | Inspect NetworkPolicy coverage, policies, or east-west reach. | `mode`, `namespace`, `target` |
| [`priority`](#priority) | Inspect scheduling priority gaps, the class ladder, or one target's priority. | `kind`, `namespace`, `target` |
| [`storage`](#storage) | Inspect workload storage and find orphaned or unclaimed volumes. | `mode`, `workload`, `resource`, `class`, `namespace` |
| [`pdb`](#pdb) | Find workloads without PodDisruptionBudgets or inspect one workload or PDB. | `target`, `workload`, `pdb` |
| [`scaling`](#scaling) | Find workloads without HPAs, list autoscaled workloads, or inspect one target. | `mode`, `namespace`, `target` |
| [`topology`](#topology) | Build a typed service topology at a selected level. | `service`, `level`, `source`, `endpoint`, `dependency` |

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

## resource_details

Read one current graph resource by exact stable ID with safe properties and bounded relationships.

Result intent: `resource`.

Table aliases: `resource_detail`, `details`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Any value | Exact hashedID or Anyshift ID. |

### Forms

#### Exact resource details

Return one resource by stable graph identity; names and fuzzy selectors are not accepted.

```console
$ annie graph query "SELECT * FROM resource_details WHERE id = 'pagerduty/escalation-policy/PQ3UO6W' LIMIT 100"
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
| `target_id` | string | No | Any value | Exact stable graph resource id; cannot be combined with target or name qualifiers. |
| `target_type` | string | No | Any value | Exact resource label used with target. |
| `namespace` | string | No | Any value | Kubernetes namespace. |
| `cluster` | string | No | Any value | Exact cluster name used with target. |
| `noise` | enum | No | `signal` (`false`, `exclude`)<br />`all` (`true`, `include`) | Whether to include noisy events. |
| `stats` | enum | No | `exact`<br />`none` | Whether to calculate exact full-window statistics. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |
| `from` | string | No | Any value | Inclusive absolute RFC3339 lower bound; requires until and excludes since. |
| `until` | string | No | Any value | Exclusive absolute RFC3339 upper bound; requires from and excludes since. |
| `cursor` | string | No | Any value | Opaque seek cursor returned by the previous bounded page. |

### Forms

#### Recent resource events

Read recent events for a resource inside a time window.

```console
$ annie graph query "SELECT * FROM events WHERE target = checkout AND since = 2h LIMIT 20"
```

#### Historical incident window

Read only an exact half-open incident interval without scanning back from now.

```console
$ annie graph query "SELECT * FROM events WHERE target = checkout AND from = '2026-08-30T10:00:00Z' AND until = '2026-08-30T11:00:00Z' AND stats = none LIMIT 20"
```

## cloud_events

Read evidence-backed AWS, Azure, GCP, and Cloudflare change events without parsing summaries.

Result intent: `cloudevents`.

Table aliases: `cloudevents`, `cloud_event`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `provider` | enum | No | `aws`<br />`azure`<br />`gcp`<br />`cloudflare` | Cloud provider. |
| `scope` | string | No | Any value | Provider scope: AWS account, Azure subscription, GCP project, or Cloudflare account. |
| `region` | string | No | Any value | Cloud region or location. |
| `category` | enum | No | `security`<br />`identity`<br />`lifecycle`<br />`configuration`<br />`capacity`<br />`backup`<br />`other` | Normalized cloud-change category. |
| `type` | string | No | Any value | Exact normalized event type. Underscores are preserved. |
| `resource` | string | No | Any value | Exact ARN, ARM ID, graph id, or unambiguous resource name. |
| `actor` | string | No | Any value | Actor identity, name, or graph id. |
| `correlation` | string | No | Any value | Anyshift event-story correlation id. |
| `operation` | string | No | Any value | Provider-native operation id. |
| `stats` | enum | No | `exact`<br />`none` | Whether to calculate exact full-window statistics. |
| `noise` | enum | No | `signal` (`false`, `exclude`)<br />`all` (`true`, `include`, `raw`) | Whether to include high-noise evidence. |
| `diff` | enum | No | `false` (`no`, `none`)<br />`true` (`yes`, `include`) | Whether to include sanitized before/after values. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |
| `cursor` | string | No | Any value | Opaque seek cursor returned by the previous page. |

### Forms

#### Recent cloud changes

Read a bounded provider-neutral cloud-change timeline.

```console
$ annie graph query "SELECT * FROM cloud_events WHERE provider = aws AND category = security AND since = 24h LIMIT 50"
```

## cloud_resources

Inspect current or recently deleted AWS, Azure, and GCP resources with freshness and provenance.

Result intent: `cloudresources`.

Table aliases: `cloudresources`, `cloud_inventory`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `provider` | enum | No | `aws`<br />`azure`<br />`gcp` | Cloud provider. |
| `scope` | string | No | Any value | Provider scope: AWS account, Azure subscription, or GCP project. |
| `region` | string | No | Any value | Cloud region or location. |
| `type` | string | No | Any value | Provider resource type, such as EC2_INSTANCE or COMPUTE_INSTANCES. |
| `resource` | string | No | Any value | Exact native id, graph id, or unambiguous resource name. |
| `lifecycle` | enum | No | `alive`<br />`deleted`<br />`all` | Resource lifecycle. Defaults to alive. |
| `provenance` | enum | No | `managed`<br />`configured`<br />`unknown` | IaC provenance status. |
| `freshness` | enum | No | `fresh`<br />`stale`<br />`unknown` | Freshness verdict relative to max_age. |
| `max_age` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |
| `cursor` | string | No | Any value | Opaque seek cursor returned by the previous page. |

### Forms

#### Current cloud inventory

List provider resources with explicit freshness and provenance evidence.

```console
$ annie graph query "SELECT * FROM cloud_resources WHERE provider = aws AND type = EC2_INSTANCE LIMIT 50"
```

## delivery_events

Read commit, CI, release, and deployment evidence from the delivery graph.

Result intent: `deliveryevents`.

Table aliases: `deliveryevents`, `delivery`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `stage` | enum | No | `commit`<br />`ci` (`pipeline`)<br />`release`<br />`deploy` (`deployment`) | Delivery stage. |
| `type` | string | No | Any value | Exact event type, such as event_release or argocd_synced. |
| `resource` | string | No | Any value | Exact graph id or unambiguous target name. |
| `actor` | string | No | Any value | Actor identity, name, or graph id. |
| `source` | string | No | Any value | Persisted event source. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |
| `cursor` | string | No | Any value | Opaque seek cursor returned by the previous page. |

### Forms

#### Recent delivery activity

Read a bounded software-delivery timeline without inferring missing actors or commits.

```console
$ annie graph query "SELECT * FROM delivery_events WHERE stage = release AND since = 7d LIMIT 50"
```

## provenance

Trace a resource to stored release, commit, and actor evidence.

Result intent: `provenance`.

Table aliases: `release_provenance`, `delivery_provenance`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Resource, repository, release, image, or service to trace. |

### Forms

#### Release provenance

Return only stored release-to-commit-to-actor evidence.

```console
$ annie graph query "SELECT * FROM provenance WHERE resource = checkout LIMIT 20"
```

## ownership

Resolve observed GitHub user or team code ownership and contact identities.

Result intent: `ownership`.

Table aliases: `owners`, `code_ownership`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Repository or resource whose observed owner is required. |

### Forms

#### Observed code ownership

Return OWNS_CODE evidence and any linked people; missing edges remain unknown.

```console
$ annie graph query "SELECT * FROM ownership WHERE resource = anyshift-io/checkout LIMIT 20"
```

## graph_coverage

Inspect current node, relationship, bridge, and event evidence by graph source.

Result intent: `graphcoverage`.

Table aliases: `graphcoverage`, `source_coverage`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `source` | enum | No | `kubernetes` (`k8s`)<br />`cloud`<br />`github` (`scm`)<br />`datadog`<br />`tempo`<br />`dynatrace`<br />`victoria`<br />`grafana` | Source universe. |

### Forms

#### Graph source coverage

Report only observed graph evidence; absent does not imply configuration state.

```console
$ annie graph query "SELECT * FROM graph_coverage"
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
| `source` | enum | No | `cloud_api`<br />`terraform_state`<br />`evaluation`<br />`unknown` | Stored inventory provenance. The filter is applied before canonical deduplication. |

### Forms

#### Resource inventory

Return the inventory for one resource type.

```console
$ annie graph query "SELECT * FROM resources WHERE type = deployment LIMIT 50"
```

## operational_impact

Find potential operational impact through reviewed directional graph relationships.

Result intent: `impact`.

Table aliases: `potential_impact`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | Yes | Any value | Root resource whose potential impact to evaluate. |
| `depth` | integer | No | Any value | Maximum propagation depth from 1 to 3. Defaults to 2. |

### Forms

#### Potential operational impact

Return resources reachable through reviewed operational impact relationships.

```console
$ annie graph query "SELECT * FROM operational_impact WHERE resource = checkout-db AND depth = 2 LIMIT 50"
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

## correlations

Reconstruct a correlated Anyshift event group around a target or correlation identifier.

Result intent: `correlations`.

Table aliases: `correlation`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Resource name or fragment. |
| `id` | string | No | Any value | Correlation identifier. |
| `type` | string | No | Any value | Optional event type filter. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Correlation by target

At least one of target or id is required; since bounds target resolution.

```console
$ annie graph query "SELECT * FROM correlations WHERE target = checkout AND since = 2h"
```

#### Correlation by id

Load one exact correlation group.

```console
$ annie graph query "SELECT * FROM correlations WHERE id = incident-123"
```

## incidents

Deprecated alias for correlations. Reconstruct a correlated Anyshift event group around a target or correlation identifier.

Result intent: `incident`.

Table aliases: `incident`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Resource name or fragment. |
| `id` | string | No | Any value | Correlation identifier. |
| `type` | string | No | Any value | Optional event type filter. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Incident by target

Deprecated. Prefer correlations. At least one of target or id is required; since bounds target resolution.

```console
$ annie graph query "SELECT * FROM incidents WHERE target = checkout AND since = 2h"
```

#### Incident by correlation id

Deprecated. Prefer correlations. Load one exact correlation group.

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

Trace bidirectional stored public-exposure routes and attached controls for one resource.

Result intent: `exposure`.

Table aliases: `exposed`, `attack_surface`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | No | Any value | Non-empty resource name or FQDN; exactly one of resource and resource_id is required. |
| `resource_id` | string | No | Any value | Non-empty stable graph or provider id; cannot be combined with resource or name qualifiers. |
| `resource_type` | string | No | Any value | Non-empty name-only qualifier; requires resource and sets exact selection. |
| `resource_namespace` | string | No | Any value | Non-empty name-only qualifier; requires resource and sets exact selection. |
| `resource_cluster` | string | No | Any value | Non-empty name-only qualifier; requires resource and sets exact selection. |
| `cursor` | string | No | Any value | Non-empty opaque seek cursor bound to the subject and perspective of the previous exposure page. |

### Forms

#### Public exposure by name

Resolve one name or FQDN and select the traversal perspective from that subject.

```console
$ annie graph query "SELECT * FROM exposure WHERE resource = api.example.com"
```

#### Public exposure by stable id

Bypass name resolution with one stable graph or provider identity.

```console
$ annie graph query "SELECT * FROM exposure WHERE resource_id = 'cf://accounts/a/zones/z/hostnames/api.example.com'"
```

#### Qualified exact public exposure

Use name-only qualifiers to force exact typed subject selection.

```console
$ annie graph query "SELECT * FROM exposure WHERE resource = checkout AND resource_type = K8S_SERVICE AND resource_namespace = payments"
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

Find the shortest infrastructure or operational path between two resources; both scopes include reviewed Cloudflare traffic edges.

Result intent: `path`.

Table aliases: `paths`.

Modifiers: `LIMIT` is not applied; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `from` | string | No | Any value | Starting resource name. Required unless from_id is supplied. |
| `from_exact` | string | No | Any value | Set true for exact-name matching instead of legacy fuzzy resolution. |
| `from_id` | string | No | Any value | Exact starting hashedID or anyshiftID. |
| `from_type` | string | No | Any value | Exact starting resource label, such as K8S_DEPLOYMENT. |
| `from_namespace` | string | No | Any value | Exact starting Kubernetes namespace. |
| `from_cluster` | string | No | Any value | Exact starting cluster name. |
| `to` | string | No | Any value | Destination resource name. Required unless to_id is supplied. |
| `to_exact` | string | No | Any value | Set true for exact-name matching instead of legacy fuzzy resolution. |
| `to_id` | string | No | Any value | Exact destination hashedID or anyshiftID. |
| `to_type` | string | No | Any value | Exact destination resource label, such as TEMPO_DATASTORE. |
| `to_namespace` | string | No | Any value | Exact destination Kubernetes namespace. |
| `to_cluster` | string | No | Any value | Exact destination cluster name. |
| `scope` | enum | No | `infrastructure`<br />`operational` | Relationships available to the path traversal. Defaults to infrastructure. |

### Forms

#### Shortest path

Each endpoint requires a name or id. Typed selectors resolve same-named resources deterministically.

```console
$ annie graph query "SELECT * FROM path WHERE from = checkout-api AND from_type = K8S_DEPLOYMENT AND to = postgresql AND to_type = TEMPO_DATASTORE AND scope = operational"
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
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Cascade by target

At least one of target or id is required; since bounds target resolution.

```console
$ annie graph query "SELECT * FROM cascade WHERE target = checkout AND since = 2h"
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
| `source` | enum | No | `auto`<br />`datadog`<br />`tempo`<br />`dynatrace` | APM dependency source. Defaults to auto. |

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
| `source` | enum | No | `auto`<br />`datadog`<br />`tempo`<br />`dynatrace` | APM dependency source. Defaults to auto. |

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
| `source` | enum | No | `auto`<br />`datadog`<br />`tempo`<br />`dynatrace` | APM dependency source. Defaults to auto. |

### Forms

#### External dependencies

Inspect services depending on one external host.

```console
$ annie graph query "SELECT * FROM external_dep WHERE target = payments.example.com"
```

## alerts

List normalized operational alerts while retaining legacy Datadog firing-monitor fields.

Result intent: `alerts`.

Table aliases: `alert`, `firing`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Legacy Datadog service or workload name. |
| `provider` | enum | No | `pagerduty` (`pd`)<br />`datadog` (`dd`)<br />`grafana`<br />`victoria`<br />`dynatrace`<br />`newrelic` (`new_relic`)<br />`incidentio` (`incident_io`) | Operational evidence provider. |
| `status` | enum | No | `firing` (`open`, `triggered`)<br />`recovered` (`resolved`)<br />`suppressed`<br />`unknown`<br />`all` | Canonical alert state. Defaults to firing. |
| `severity` | enum | No | `critical`<br />`warning`<br />`info`<br />`unknown` | Canonical alert severity. |
| `service_id` | string | No | Any value | Exact stable identity of a canonical graph service. |
| `service` | string | No | Any value | Exact canonical graph service name. |
| `service_type` | string | No | Any value | Exact canonical graph service label. |
| `service_namespace` | string | No | Any value | Exact canonical service namespace. |
| `service_cluster` | string | No | Any value | Exact canonical service cluster. |
| `provider_service_id` | string | No | Any value | Exact provider-native service identifier. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |
| `from` | string | No | Any value | Absolute RFC3339 lower time bound. |
| `to` | string | No | Any value | Absolute RFC3339 upper time bound. |
| `at` | string | No | Any value | Absolute RFC3339 point in time, or now. |
| `cursor` | string | No | Any value | Opaque keyset cursor returned by a previous page. |

### Forms

#### Current alerts

List firing operational alerts; legacy Datadog fields remain additive siblings.

```console
$ annie graph query "SELECT * FROM alerts WHERE status = firing LIMIT 20"
```

## response_incidents

List provider-neutral response incidents that coordinate alert handling.

Result intent: `responseincidents`.

Table aliases: `response_incident`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `provider` | enum | No | `pagerduty` (`pd`)<br />`datadog` (`dd`)<br />`grafana`<br />`victoria`<br />`dynatrace`<br />`newrelic` (`new_relic`)<br />`incidentio` (`incident_io`) | Operational evidence provider. |
| `status` | enum | No | `active`<br />`open` (`triggered`)<br />`acknowledged` (`acked`)<br />`resolved` (`closed`)<br />`unknown`<br />`all` | Canonical response-incident state. Defaults to open and acknowledged. |
| `service_id` | string | No | Any value | Exact stable identity of a canonical graph service. |
| `service` | string | No | Any value | Exact canonical graph service name. |
| `service_type` | string | No | Any value | Exact canonical graph service label. |
| `service_namespace` | string | No | Any value | Exact canonical service namespace. |
| `service_cluster` | string | No | Any value | Exact canonical service cluster. |
| `provider_service_id` | string | No | Any value | Exact provider-native service identifier. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |
| `from` | string | No | Any value | Absolute RFC3339 lower time bound. |
| `to` | string | No | Any value | Absolute RFC3339 upper time bound. |
| `at` | string | No | Any value | Absolute RFC3339 point in time, or now. |
| `cursor` | string | No | Any value | Opaque keyset cursor returned by a previous page. |
| `responder` | string | No | Any value | Exact display name, canonical person ID or email, or provider user ID. |
| `urgency` | string | No | Any value | Provider urgency value; preserved as provider-specific evidence. |

### Forms

#### Active response incidents

List open or acknowledged incidents from stored graph evidence.

```console
$ annie graph query "SELECT * FROM response_incidents WHERE provider = pagerduty LIMIT 50"
```

## oncall

List effective on-call responsibility for a point in time or bounded window.

Result intent: `oncall`.

Table aliases: `on_call`, `oncalls`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `provider` | enum | No | `pagerduty` (`pd`)<br />`datadog` (`dd`)<br />`grafana`<br />`victoria`<br />`dynatrace`<br />`newrelic` (`new_relic`)<br />`incidentio` (`incident_io`) | Operational evidence provider. |
| `status` | enum | No | `scheduled`<br />`active`<br />`ended`<br />`all` | Canonical on-call window state. |
| `service_id` | string | No | Any value | Exact stable identity of a canonical graph service. |
| `service` | string | No | Any value | Exact canonical graph service name. |
| `service_type` | string | No | Any value | Exact canonical graph service label. |
| `service_namespace` | string | No | Any value | Exact canonical service namespace. |
| `service_cluster` | string | No | Any value | Exact canonical service cluster. |
| `provider_service_id` | string | No | Any value | Exact provider-native service identifier. |
| `from` | string | No | Any value | Absolute RFC3339 lower time bound. |
| `to` | string | No | Any value | Absolute RFC3339 upper time bound. |
| `at` | string | No | Any value | Absolute RFC3339 point in time, or now. |
| `cursor` | string | No | Any value | Opaque keyset cursor returned by a previous page. |
| `person` | string | No | Any value | Exact source identity or canonical person identity. |
| `schedule` | string | No | Any value | Exact provider schedule identifier. |

### Forms

#### Current on-call

List effective on-call windows at the selected point in time.

```console
$ annie graph query "SELECT * FROM oncall WHERE at = now LIMIT 50"
```

## incident_context

Group stored incident, alert, service, on-call, responder, and reviewed history hops without live provider calls.

Result intent: `incidentcontext`.

Table aliases: `incidentcontext`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `id` | string | No | Any value | Exact provider incident ID or Anyshift incident ID. |
| `target` | string | No | Any value | Exact canonical resource name, Anyshift ID, hashed ID, or provider service identity. |
| `provider` | enum | No | `pagerduty` (`pd`)<br />`datadog` (`dd`)<br />`grafana`<br />`victoria`<br />`dynatrace`<br />`newrelic` (`new_relic`)<br />`incidentio` (`incident_io`) | Operational evidence provider. |
| `since` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Incident context by provider id

Exactly one of id or target is required. History uses stored similar incidents and reviewed resolution evidence.

```console
$ annie graph query "SELECT * FROM incident_context WHERE id = Q2Q5QBE019PJM5 LIMIT 10"
```

#### Incident context by mapped service

Resolve the latest stored incident that AFFECTS a PagerDuty service with RESOLVES_TO the named resource.

```console
$ annie graph query "SELECT * FROM incident_context WHERE target = checkout AND since = 30d LIMIT 10"
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

Inspect APM service callers, callees, and HTTP route evidence or rank call-graph fan-in.

Result intent: `calls`.

Table aliases: `call`, `callgraph`.

Modifiers: `LIMIT`; `OFFSET` is not applied.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `target` | string | No | Any value | Service name. |
| `source` | enum | No | `auto`<br />`datadog`<br />`tempo`<br />`dynatrace` | APM dependency source. Defaults to auto. |

### Forms

#### Service calls

Inspect callers, callees, and available templated HTTP operations for one service.

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
| `source` | enum | No | `auto`<br />`datadog`<br />`tempo`<br />`dynatrace` | APM dependency source. Defaults to auto. |

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

## iac

Inspect Terraform code-to-state-to-cloud provenance and linkage coverage.

Result intent: `iac`.

Table aliases: `terraform`, `iac_provenance`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | No | Any value | Terraform address or Terraform, state, or cloud graph identifier. |
| `status` | enum | No | `managed`<br />`unlinked`<br />`missing_cloud` (`missingcloud`, `state_only`)<br />`ambiguous`<br />`stale`<br />`invalid` | IaC linkage status. |
| `freshness` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### IaC coverage

Summarize Terraform code-to-state-to-cloud linkage and return a bounded resource page.

```console
$ annie graph query "SELECT * FROM iac LIMIT 50"
```

#### Resource provenance

Show one resource's Terraform, state, and cloud evidence. Exact state/cloud identifiers select their relationship chain; a generic Terraform declaration keeps all instances.

```console
$ annie graph query "SELECT * FROM iac WHERE resource = aws_instance.api_server"
```

#### IaC linkage gaps

List resources with one evidence-backed linkage status.

```console
$ annie graph query "SELECT * FROM iac WHERE status = unlinked LIMIT 50"
```

## iac_drift

Compare last-applied Terraform state with fresh observed cloud properties.

Result intent: `iacdrift`.

Table aliases: `terraform_drift`, `drift`.

Modifiers: `LIMIT`; `OFFSET`.

### Filters

| Filter | Type | Required | Accepted values | Description |
| --- | --- | --- | --- | --- |
| `resource` | string | No | Any value | Terraform address or Terraform, state, or cloud graph identifier. |
| `status` | enum | No | `drifted`<br />`in_sync` (`insync`, `synced`)<br />`unknown` | Drift verdict. |
| `freshness` | duration | No | Any value | Relative lookback such as 30m, 2h, 1d, or today. |

### Forms

#### Current IaC drift

List supported state-to-cloud differences, excluding unknown evidence by default.

```console
$ annie graph query "SELECT * FROM iac_drift WHERE status = drifted LIMIT 50"
```

#### Resource drift

Evaluate one Terraform resource using its state and cloud evidence.

```console
$ annie graph query "SELECT * FROM iac_drift WHERE resource = aws_instance.api_server"
```

## gitops

Inspect GitOps drift, unmanaged workloads, or resource ownership.

Result intent: `gitops`.

Table aliases: `argocd`, `gitops_drift`, `argocd_drift`.

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
| `digest` | string | No | Any value | Exact running image digest (sha256, repository digest, or runtime image ID). |
| `kind` | enum | No | `nomemlimit` (`no_mem_limit`, `nomemorylimit`)<br />`nocpurequest` (`no_cpu_request`)<br />`skew` (`versionskew`, `version_skew`) | Container hygiene scan. |
| `namespace` | string | No | Any value | Namespace scope for a hygiene scan. |

### Forms

#### Runtime digest usage

Find live containers and owning workloads running an exact image digest.

```console
$ annie graph query "SELECT * FROM image WHERE digest = 'sha256:776129790f01a675bb6e98447c2a28d43a07144d5410691823dbf9a21d256b1e' LIMIT 50"
```

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
| `source` | enum | No | `auto`<br />`datadog`<br />`tempo`<br />`dynatrace`<br />`configuration` | Topology evidence source. Defaults to auto-discovered APM evidence. |
| `endpoint` | string | No | Any value | Explicit endpoint alias used to prove a configured dependency. |
| `dependency` | string | No | Any value | Catalog service name represented by the endpoint alias. |

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

