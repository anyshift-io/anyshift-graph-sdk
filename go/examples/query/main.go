package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	graph "github.com/anyshift-io/anyshift-graph-sdk/go"
)

func main() {
	client := graph.NewFromEnv()
	result, err := client.Events(context.Background(), graph.EventsParams{
		Type:  "oom",
		Since: graph.Since("1h"),
		Limit: graph.Int(10),
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "query failed: %v\n", err)
		os.Exit(1)
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	if err := enc.Encode(result); err != nil {
		fmt.Fprintf(os.Stderr, "encode failed: %v\n", err)
		os.Exit(1)
	}
}
