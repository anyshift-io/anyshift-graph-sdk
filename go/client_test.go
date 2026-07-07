package graph

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func newTestClient(t *testing.T, handler http.HandlerFunc, opts ...Option) (*Client, *httptest.Server) {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	all := append([]Option{WithBaseURL(srv.URL + "/"), WithToken("anys_api_test")}, opts...)
	return NewClient(all...), srv
}

func TestQueryPostsBodyAndHeaders(t *testing.T) {
	var gotAuth, gotMethod, gotPath, gotContentType, gotUserAgent, gotSQL string
	c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotContentType = r.Header.Get("Content-Type")
		gotUserAgent = r.Header.Get("User-Agent")
		var body map[string]string
		_ = json.NewDecoder(r.Body).Decode(&body)
		gotSQL = body["sql"]
		_ = json.NewEncoder(w).Encode(map[string]any{"question": gotSQL, "intent": "events", "summary": "ok"})
	}, WithUserAgent("test-agent"))

	res, err := c.Query(context.Background(), "SELECT * FROM events")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.Summary != "ok" {
		t.Fatalf("summary: got %q", res.Summary)
	}
	if gotAuth != "Bearer anys_api_test" {
		t.Errorf("auth header: got %q", gotAuth)
	}
	if gotMethod != http.MethodPost || gotPath != "/v1/query" {
		t.Errorf("request line: got %s %s", gotMethod, gotPath)
	}
	if gotContentType != "application/json" || gotUserAgent != "test-agent" {
		t.Errorf("headers: content-type=%q user-agent=%q", gotContentType, gotUserAgent)
	}
	if gotSQL != "SELECT * FROM events" {
		t.Errorf("sql body: got %q", gotSQL)
	}
}

func TestAskAndQueryUseProjectScopedPaths(t *testing.T) {
	var paths []string
	c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		paths = append(paths, r.RequestURI)
		_ = json.NewEncoder(w).Encode(map[string]any{"question": "x", "intent": "events", "summary": "ok"})
	}, WithProjectID("proj/a"))

	if _, err := c.Query(context.Background(), "SELECT * FROM events"); err != nil {
		t.Fatalf("query: %v", err)
	}
	if _, err := c.Ask(context.Background(), "what changed?"); err != nil {
		t.Fatalf("ask: %v", err)
	}
	if paths[0] != "/v1/projects/proj%2Fa/query" || paths[1] != "/v1/projects/proj%2Fa/ask" {
		t.Fatalf("paths: got %#v", paths)
	}
}

func TestAPIErrorEnvelopeAndFallbacks(t *testing.T) {
	cases := []struct {
		name       string
		status     int
		body       string
		wantCode   string
		wantMsg    string
		wantAuth   bool
		wantBadReq bool
	}{
		{
			name:       "structured unauthorized",
			status:     http.StatusUnauthorized,
			body:       `{"error":{"code":"unauthorized","message":"nope"}}`,
			wantCode:   "unauthorized",
			wantMsg:    "nope",
			wantAuth:   true,
			wantBadReq: false,
		},
		{
			name:       "structured bad request",
			status:     http.StatusBadRequest,
			body:       `{"error":{"code":"bad_request","message":"bad sql"}}`,
			wantCode:   "bad_request",
			wantMsg:    "bad sql",
			wantAuth:   false,
			wantBadReq: true,
		},
		{
			name:       "non json fallback",
			status:     http.StatusInternalServerError,
			body:       `plain failure`,
			wantCode:   "",
			wantMsg:    "plain failure",
			wantAuth:   false,
			wantBadReq: false,
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tc.status)
				_, _ = w.Write([]byte(tc.body))
			})
			_, err := c.Query(context.Background(), "SELECT * FROM events")
			if err == nil {
				t.Fatalf("expected error")
			}
			var apiErr *APIError
			if !errors.As(err, &apiErr) {
				t.Fatalf("expected *APIError, got %T: %v", err, err)
			}
			if apiErr.StatusCode != tc.status || apiErr.Code != tc.wantCode || apiErr.Message != tc.wantMsg {
				t.Fatalf("api error: got status=%d code=%q msg=%q", apiErr.StatusCode, apiErr.Code, apiErr.Message)
			}
			if IsAuthError(err) != tc.wantAuth || IsBadRequest(err) != tc.wantBadReq {
				t.Fatalf("classifiers: auth=%v bad=%v", IsAuthError(err), IsBadRequest(err))
			}
		})
	}
}

func TestNetworkFailure(t *testing.T) {
	c := NewClient(WithBaseURL("http://127.0.0.1:1"))
	_, err := c.Query(context.Background(), "SELECT * FROM events")
	if err == nil || !strings.Contains(err.Error(), "performing graph api request") {
		t.Fatalf("expected network wrapper, got %v", err)
	}
}
