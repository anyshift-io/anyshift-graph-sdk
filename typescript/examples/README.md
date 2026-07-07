# TypeScript Examples

Set credentials before running examples:

```bash
export ANYSHIFT_API_TOKEN="anys_api_..."
export ANYSHIFT_PROJECT_ID="00000000-0000-0000-0000-000000000000"
```

Run examples from the `typescript/` directory with `tsx`:

```bash
npx tsx examples/recent-events.ts
npx tsx examples/blast-radius.ts checkout
npx tsx examples/path.ts checkout checkout-postgres
npx tsx examples/raw-query.ts "SELECT * FROM events LIMIT 5"
```
