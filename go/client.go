package graph

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	DefaultBaseURL   = "https://graph.anyshift.io"
	defaultUserAgent = "anyshift-graph-sdk-go/0.1.0"
)

type Client struct {
	baseURL    string
	token      string
	projectID  string
	httpClient *http.Client
	userAgent  string
}

type Option func(*Client)

func NewClient(opts ...Option) *Client {
	c := &Client{
		baseURL:    DefaultBaseURL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		userAgent:  defaultUserAgent,
	}
	for _, opt := range opts {
		opt(c)
	}
	c.baseURL = strings.TrimRight(c.baseURL, "/")
	return c
}

func NewFromEnv() *Client {
	opts := []Option{
		WithToken(os.Getenv("ANYSHIFT_TOKEN")),
		WithProjectID(os.Getenv("ANYSHIFT_PROJECT_ID")),
	}
	if baseURL := os.Getenv("ENGINE_URL"); baseURL != "" {
		opts = append(opts, WithBaseURL(baseURL))
	}
	return NewClient(opts...)
}

func WithBaseURL(baseURL string) Option {
	return func(c *Client) {
		if strings.TrimSpace(baseURL) != "" {
			c.baseURL = strings.TrimRight(strings.TrimSpace(baseURL), "/")
		}
	}
}

func WithToken(token string) Option {
	return func(c *Client) {
		c.token = token
	}
}

func WithProjectID(projectID string) Option {
	return func(c *Client) {
		c.projectID = projectID
	}
}

func WithHTTPClient(httpClient *http.Client) Option {
	return func(c *Client) {
		if httpClient != nil {
			c.httpClient = httpClient
		}
	}
}

func WithUserAgent(userAgent string) Option {
	return func(c *Client) {
		if strings.TrimSpace(userAgent) != "" {
			c.userAgent = strings.TrimSpace(userAgent)
		}
	}
}

func (c *Client) Query(ctx context.Context, sql string) (*AskResult, error) {
	var out AskResult
	if err := c.post(ctx, c.routePath("query"), QueryRequest{Sql: sql}, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *Client) Ask(ctx context.Context, question string) (*AskResult, error) {
	var out AskResult
	if err := c.post(ctx, c.routePath("ask"), AskRequest{Question: question}, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *Client) routePath(kind string) string {
	if c.projectID == "" {
		return "/v1/" + kind
	}
	return "/v1/projects/" + url.PathEscape(c.projectID) + "/" + kind
}

func (c *Client) post(ctx context.Context, path string, body any, out any) error {
	payload, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("encoding request body: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("building request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", c.userAgent)
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("performing graph api request: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("reading response body: %w", err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return decodeAPIError(resp.StatusCode, raw)
	}
	if out != nil && len(raw) > 0 {
		if err := json.Unmarshal(raw, out); err != nil {
			return fmt.Errorf("decoding response: %w", err)
		}
	}
	return nil
}

func decodeAPIError(statusCode int, raw []byte) error {
	apiErr := &APIError{StatusCode: statusCode, Message: strings.TrimSpace(string(raw))}
	var envelope struct {
		Error any    `json:"error"`
		Code  string `json:"code"`
	}
	if json.Unmarshal(raw, &envelope) == nil {
		switch errValue := envelope.Error.(type) {
		case map[string]any:
			if code, ok := errValue["code"].(string); ok {
				apiErr.Code = code
			}
			if message, ok := errValue["message"].(string); ok {
				apiErr.Message = message
			}
		case string:
			apiErr.Message = errValue
		}
		if apiErr.Code == "" {
			apiErr.Code = envelope.Code
		}
	}
	if apiErr.Message == "" {
		apiErr.Message = http.StatusText(statusCode)
	}
	return apiErr
}
