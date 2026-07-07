package graph

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"
)

func captureSQL(t *testing.T) (*Client, *[]string) {
	t.Helper()
	var calls []string
	c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		var body map[string]string
		_ = json.NewDecoder(r.Body).Decode(&body)
		calls = append(calls, body["sql"])
		_ = json.NewEncoder(w).Encode(map[string]any{"question": body["sql"], "intent": "events", "summary": "ok"})
	})
	return c, &calls
}

func TestTypedMethodsComposeSQL(t *testing.T) {
	ctx := context.Background()
	cases := []struct {
		name string
		call func(*Client) error
		want string
	}{
		{"connections", func(c *Client) error { _, err := c.Connections(ctx, "harvestor"); return err }, "SELECT * FROM connections WHERE resource = 'harvestor'"},
		{"inventory", func(c *Client) error { _, err := c.Inventory(ctx, "service"); return err }, "SELECT * FROM resources WHERE type = 'service'"},
		{"events", func(c *Client) error {
			_, err := c.Events(ctx, EventsParams{Type: "oom", Since: "1h", Limit: Int(50), Offset: Int(100)})
			return err
		}, "SELECT * FROM events WHERE type = 'oom' AND since = '1h' LIMIT 50 OFFSET 100"},
		{"events noise all", func(c *Client) error {
			_, err := c.Events(ctx, EventsParams{Type: "unhealthy", Noise: "all"})
			return err
		}, "SELECT * FROM events WHERE type = 'unhealthy' AND noise = 'all'"},
		{"hotspots", func(c *Client) error {
			_, err := c.Hotspots(ctx, HotspotsParams{Type: "oom", By: "resource", Limit: Int(10)})
			return err
		}, "SELECT * FROM hotspots WHERE type = 'oom' AND by = 'resource' LIMIT 10"},
		{"incident", func(c *Client) error { _, err := c.Incident(ctx, CascadeParams{Target: "places"}); return err }, "SELECT * FROM incidents WHERE target = 'places'"},
		{"failures", func(c *Client) error {
			_, err := c.Failures(ctx, FeedParams{Namespace: "payment", Since: "2h", Limit: Int(10)})
			return err
		}, "SELECT * FROM failures WHERE namespace = 'payment' AND since = '2h' LIMIT 10"},
		{"deployments", func(c *Client) error { _, err := c.Deployments(ctx, FeedParams{Since: "1h"}); return err }, "SELECT * FROM deployments WHERE since = '1h'"},
		{"audit", func(c *Client) error { _, err := c.Audit(ctx, AuditParams{Type: "role"}); return err }, "SELECT * FROM audit WHERE type = 'role'"},
		{"nodes", func(c *Client) error { _, err := c.Nodes(ctx, NodeParams{Since: "6h"}); return err }, "SELECT * FROM nodes WHERE since = '6h'"},
		{"deploy impact", func(c *Client) error {
			_, err := c.DeployImpact(ctx, DeployImpactParams{Target: "pro-pim", Since: "24h"})
			return err
		}, "SELECT * FROM deploy_impact WHERE target = 'pro-pim' AND since = '24h'"},
		{"common cause", func(c *Client) error {
			_, err := c.CommonCause(ctx, CommonCauseParams{Namespace: "payment", Since: "2h"})
			return err
		}, "SELECT * FROM common_cause WHERE namespace = 'payment' AND since = '2h'"},
		{"blast", func(c *Client) error {
			_, err := c.Blast(ctx, BlastParams{Resource: "central-authentication-service-warmup"})
			return err
		}, "SELECT * FROM blast_radius WHERE resource = 'central-authentication-service-warmup'"},
		{"spof", func(c *Client) error {
			_, err := c.Spof(ctx, SpofParams{Kind: "serviceaccount", Namespace: "payment", Limit: Int(5)})
			return err
		}, "SELECT * FROM spof WHERE kind = 'serviceaccount' AND namespace = 'payment' LIMIT 5"},
		{"orphans", func(c *Client) error {
			_, err := c.Orphans(ctx, OrphansParams{Kind: "role", Namespace: "payment", Limit: Int(5)})
			return err
		}, "SELECT * FROM orphans WHERE kind = 'role' AND namespace = 'payment' LIMIT 5"},
		{"coverage", func(c *Client) error {
			_, err := c.Coverage(ctx, CoverageParams{Kind: "monitor", Namespace: "payment", Limit: Int(5)})
			return err
		}, "SELECT * FROM coverage WHERE kind = 'monitor' AND namespace = 'payment' LIMIT 5"},
		{"access", func(c *Client) error { _, err := c.Access(ctx, ResourceParams{Resource: "ci-deployer"}); return err }, "SELECT * FROM access WHERE resource = 'ci-deployer'"},
		{"exposure", func(c *Client) error {
			_, err := c.Exposure(ctx, ResourceParams{Resource: "public-ingress"})
			return err
		}, "SELECT * FROM exposure WHERE resource = 'public-ingress'"},
		{"tenancy", func(c *Client) error { _, err := c.Tenancy(ctx, ResourceParams{Resource: "payments-api"}); return err }, "SELECT * FROM tenancy WHERE resource = 'payments-api'"},
		{"shared config", func(c *Client) error {
			_, err := c.SharedConfig(ctx, ResourceParams{Resource: "app-config", Limit: Int(5)})
			return err
		}, "SELECT * FROM sharedconfig WHERE resource = 'app-config' LIMIT 5"},
		{"path", func(c *Client) error {
			_, err := c.Path(ctx, PathParams{From: "central-authentication-service", To: "kube-dns"})
			return err
		}, "SELECT * FROM path WHERE from = 'central-authentication-service' AND to = 'kube-dns'"},
		{"cascade", func(c *Client) error {
			_, err := c.Cascade(ctx, CascadeParams{ID: "f48063a4-d4d7-5a0b-93bf-da87cc126940"})
			return err
		}, "SELECT * FROM cascade WHERE id = 'f48063a4-d4d7-5a0b-93bf-da87cc126940'"},
		{"alert impact", func(c *Client) error { _, err := c.AlertImpact(ctx, "gke-prod-1-node-x"); return err }, "SELECT * FROM alert_impact WHERE resource = 'gke-prod-1-node-x'"},
		{"monitor", func(c *Client) error { _, err := c.Monitor(ctx, "user-locations-broker"); return err }, "SELECT * FROM monitor WHERE target = 'user-locations-broker'"},
		{"datastore", func(c *Client) error {
			_, err := c.Datastore(ctx, TargetParams{Target: "mariadb-billing", Limit: Int(5)})
			return err
		}, "SELECT * FROM datastore WHERE target = 'mariadb-billing' LIMIT 5"},
		{"flow", func(c *Client) error {
			_, err := c.Flow(ctx, TargetParams{Target: "gillbus-update-geography"})
			return err
		}, "SELECT * FROM flow WHERE target = 'gillbus-update-geography'"},
		{"external dep", func(c *Client) error { _, err := c.ExternalDep(ctx, TargetParams{Target: "nexmo.com"}); return err }, "SELECT * FROM external_dep WHERE target = 'nexmo.com'"},
		{"slo", func(c *Client) error {
			_, err := c.SLO(ctx, TargetParams{Target: "checkout availability", Limit: Int(5)})
			return err
		}, "SELECT * FROM slo WHERE target = 'checkout availability' LIMIT 5"},
		{"alerts", func(c *Client) error {
			_, err := c.Alerts(ctx, TargetParams{Target: "payment", Limit: Int(20)})
			return err
		}, "SELECT * FROM alerts WHERE target = 'payment' LIMIT 20"},
		{"calls", func(c *Client) error { _, err := c.Calls(ctx, TargetParams{Target: "feature-flags"}); return err }, "SELECT * FROM calls WHERE target = 'feature-flags'"},
		{"service tree", func(c *Client) error {
			_, err := c.ServiceTree(ctx, TargetParams{Target: "payment", Limit: Int(5)})
			return err
		}, "SELECT * FROM servicetree WHERE target = 'payment' LIMIT 5"},
		{"alert cause", func(c *Client) error {
			_, err := c.AlertCause(ctx, AlertCauseParams{Target: "payout-servix", Since: "6h"})
			return err
		}, "SELECT * FROM alert_cause WHERE target = 'payout-servix' AND since = '6h'"},
		{"image", func(c *Client) error {
			_, err := c.Image(ctx, ImageParams{Kind: "nomemlimit", Namespace: "payment"})
			return err
		}, "SELECT * FROM image WHERE kind = 'nomemlimit' AND namespace = 'payment'"},
		{"quote stripping", func(c *Client) error { _, err := c.Events(ctx, EventsParams{Target: "can't"}); return err }, "SELECT * FROM events WHERE target = 'cant'"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			c, calls := captureSQL(t)
			if err := tc.call(c); err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if len(*calls) != 1 || (*calls)[0] != tc.want {
				t.Fatalf("sql: got %#v want %q", *calls, tc.want)
			}
		})
	}
}

func TestBareSelectWhenNoFilters(t *testing.T) {
	c, calls := captureSQL(t)
	if _, err := c.Failures(context.Background(), FeedParams{}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if (*calls)[0] != "SELECT * FROM failures" {
		t.Fatalf("sql: got %q", (*calls)[0])
	}
}
