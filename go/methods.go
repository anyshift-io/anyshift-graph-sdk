package graph

import (
	"context"
	"fmt"
	"math"
	"strings"
)

type Since string

type EventsParams struct {
	Type      string
	Target    string
	Namespace string
	Noise     string
	Since     Since
	Limit     *int
	Offset    *int
}

type HotspotsParams struct {
	Type      string
	By        string
	Namespace string
	Since     Since
	Limit     *int
}

type FeedParams struct {
	Target    string
	Namespace string
	Since     Since
	Limit     *int
	Offset    *int
}

type AuditParams struct {
	Target    string
	Namespace string
	Type      string
	Since     Since
	Limit     *int
	Offset    *int
}

type NodeParams struct {
	Target string
	Since  Since
	Limit  *int
	Offset *int
}

type DeployImpactParams struct {
	Target string
	Since  Since
	Limit  *int
}

type CommonCauseParams struct {
	Namespace string
	Since     Since
	Limit     *int
}

type BlastParams struct {
	Resource string
	Limit    *int
}

type SpofParams struct {
	Kind      string
	Namespace string
	Limit     *int
}

type OrphansParams struct {
	Kind      string
	Namespace string
	Limit     *int
}

type CoverageParams struct {
	Kind      string
	Namespace string
	Limit     *int
}

type ResourceParams struct {
	Resource string
	Limit    *int
}

type PathParams struct {
	From string
	To   string
}

type CascadeParams struct {
	Target string
	ID     string
}

type TargetParams struct {
	Target string
	Limit  *int
}

type AlertCauseParams struct {
	Target string
	Since  Since
	Limit  *int
}

type ImageParams struct {
	Target    string
	Workload  string
	Kind      string
	Namespace string
	Limit     *int
}

type condition struct {
	key   string
	value string
}

func Int(v int) *int {
	return &v
}

func (c *Client) Connections(ctx context.Context, resource string) (*AskResult, error) {
	return c.Query(ctx, compose("connections", []condition{{"resource", resource}}, nil, nil))
}

func (c *Client) Inventory(ctx context.Context, typ string) (*AskResult, error) {
	return c.Query(ctx, compose("resources", []condition{{"type", typ}}, nil, nil))
}

func (c *Client) Events(ctx context.Context, p EventsParams) (*AskResult, error) {
	noise := ""
	if p.Noise == "all" {
		noise = "all"
	}
	return c.Query(ctx, compose("events", []condition{
		{"type", p.Type},
		{"target", p.Target},
		{"namespace", p.Namespace},
		{"noise", noise},
		{"since", string(p.Since)},
	}, p.Limit, p.Offset))
}

func (c *Client) Hotspots(ctx context.Context, p HotspotsParams) (*AskResult, error) {
	return c.Query(ctx, compose("hotspots", []condition{
		{"type", p.Type},
		{"by", p.By},
		{"namespace", p.Namespace},
		{"since", string(p.Since)},
	}, p.Limit, nil))
}

func (c *Client) Incident(ctx context.Context, p CascadeParams) (*AskResult, error) {
	return c.Query(ctx, compose("incidents", []condition{{"id", p.ID}, {"target", p.Target}}, nil, nil))
}

func (c *Client) Failures(ctx context.Context, p FeedParams) (*AskResult, error) {
	return c.Query(ctx, feedSQL("failures", p))
}

func (c *Client) Deployments(ctx context.Context, p FeedParams) (*AskResult, error) {
	return c.Query(ctx, feedSQL("deployments", p))
}

func (c *Client) Audit(ctx context.Context, p AuditParams) (*AskResult, error) {
	return c.Query(ctx, compose("audit", []condition{
		{"target", p.Target},
		{"namespace", p.Namespace},
		{"type", p.Type},
		{"since", string(p.Since)},
	}, p.Limit, p.Offset))
}

func (c *Client) Nodes(ctx context.Context, p NodeParams) (*AskResult, error) {
	return c.Query(ctx, compose("nodes", []condition{{"target", p.Target}, {"since", string(p.Since)}}, p.Limit, p.Offset))
}

func (c *Client) DeployImpact(ctx context.Context, p DeployImpactParams) (*AskResult, error) {
	return c.Query(ctx, compose("deploy_impact", []condition{{"target", p.Target}, {"since", string(p.Since)}}, p.Limit, nil))
}

func (c *Client) CommonCause(ctx context.Context, p CommonCauseParams) (*AskResult, error) {
	return c.Query(ctx, compose("common_cause", []condition{{"namespace", p.Namespace}, {"since", string(p.Since)}}, p.Limit, nil))
}

func (c *Client) Blast(ctx context.Context, p BlastParams) (*AskResult, error) {
	return c.Query(ctx, compose("blast_radius", []condition{{"resource", p.Resource}}, p.Limit, nil))
}

func (c *Client) Spof(ctx context.Context, p SpofParams) (*AskResult, error) {
	return c.Query(ctx, compose("spof", []condition{{"kind", p.Kind}, {"namespace", p.Namespace}}, p.Limit, nil))
}

func (c *Client) Orphans(ctx context.Context, p OrphansParams) (*AskResult, error) {
	return c.Query(ctx, compose("orphans", []condition{{"kind", p.Kind}, {"namespace", p.Namespace}}, p.Limit, nil))
}

func (c *Client) Coverage(ctx context.Context, p CoverageParams) (*AskResult, error) {
	return c.Query(ctx, compose("coverage", []condition{{"kind", p.Kind}, {"namespace", p.Namespace}}, p.Limit, nil))
}

func (c *Client) Access(ctx context.Context, p ResourceParams) (*AskResult, error) {
	return c.Query(ctx, compose("access", []condition{{"resource", p.Resource}}, p.Limit, nil))
}

func (c *Client) Exposure(ctx context.Context, p ResourceParams) (*AskResult, error) {
	return c.Query(ctx, compose("exposure", []condition{{"resource", p.Resource}}, p.Limit, nil))
}

func (c *Client) Tenancy(ctx context.Context, p ResourceParams) (*AskResult, error) {
	return c.Query(ctx, compose("tenancy", []condition{{"resource", p.Resource}}, p.Limit, nil))
}

func (c *Client) SharedConfig(ctx context.Context, p ResourceParams) (*AskResult, error) {
	return c.Query(ctx, compose("sharedconfig", []condition{{"resource", p.Resource}}, p.Limit, nil))
}

func (c *Client) Path(ctx context.Context, p PathParams) (*AskResult, error) {
	return c.Query(ctx, compose("path", []condition{{"from", p.From}, {"to", p.To}}, nil, nil))
}

func (c *Client) Cascade(ctx context.Context, p CascadeParams) (*AskResult, error) {
	return c.Query(ctx, compose("cascade", []condition{{"target", p.Target}, {"id", p.ID}}, nil, nil))
}

func (c *Client) AlertImpact(ctx context.Context, resource string) (*AskResult, error) {
	return c.Query(ctx, compose("alert_impact", []condition{{"resource", resource}}, nil, nil))
}

func (c *Client) Monitor(ctx context.Context, target string) (*AskResult, error) {
	return c.Query(ctx, compose("monitor", []condition{{"target", target}}, nil, nil))
}

func (c *Client) Datastore(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("datastore", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) Flow(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("flow", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) ExternalDep(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("external_dep", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) SLO(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("slo", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) Alerts(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("alerts", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) Calls(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("calls", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) ServiceTree(ctx context.Context, p TargetParams) (*AskResult, error) {
	return c.Query(ctx, compose("servicetree", []condition{{"target", p.Target}}, p.Limit, nil))
}

func (c *Client) AlertCause(ctx context.Context, p AlertCauseParams) (*AskResult, error) {
	return c.Query(ctx, compose("alert_cause", []condition{{"target", p.Target}, {"since", string(p.Since)}}, p.Limit, nil))
}

func (c *Client) Image(ctx context.Context, p ImageParams) (*AskResult, error) {
	return c.Query(ctx, compose("image", []condition{
		{"target", p.Target},
		{"workload", p.Workload},
		{"kind", p.Kind},
		{"namespace", p.Namespace},
	}, p.Limit, nil))
}

func feedSQL(table string, p FeedParams) string {
	return compose(table, []condition{
		{"target", p.Target},
		{"namespace", p.Namespace},
		{"since", string(p.Since)},
	}, p.Limit, p.Offset)
}

func compose(table string, conds []condition, limit *int, offset *int) string {
	parts := make([]string, 0, len(conds))
	for _, cond := range conds {
		if cond.value == "" {
			continue
		}
		parts = append(parts, fmt.Sprintf("%s = %s", cond.key, lit(cond.value)))
	}
	sql := "SELECT * FROM " + table
	if len(parts) > 0 {
		sql += " WHERE " + strings.Join(parts, " AND ")
	}
	if limit != nil {
		sql += fmt.Sprintf(" LIMIT %d", int(math.Floor(float64(*limit))))
	}
	if offset != nil {
		sql += fmt.Sprintf(" OFFSET %d", int(math.Floor(float64(*offset))))
	}
	return sql
}

func lit(v string) string {
	return "'" + strings.ReplaceAll(v, "'", "") + "'"
}
