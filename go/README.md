# Anyshift Graph SDK for Go

Read-only Go client for the Anyshift Graph API.

```go
client := graph.NewFromEnv()
result, err := client.Events(ctx, graph.EventsParams{
	Type:  "oom",
	Since: graph.Since("1h"),
	Limit: graph.Int(10),
})
```

## Environment

```bash
export ANYSHIFT_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

`NewFromEnv()` uses `https://graph.anyshift.io` by default. Set `ENGINE_URL` to point at a local
or non-production Graph API.

## Development

```bash
go generate ./...
go test ./...
```

Generated public models come from `../openapi/graph-api.v1.json`; do not import server internals.
