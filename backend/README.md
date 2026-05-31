# Rumour Backend

Express API for hyper-local buzz discovery.

## Run

```bash
npm install
npm start
```

Default: `http://0.0.0.0:5000`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Status + `dataSource` (`mock` or `firestore`) |
| GET | `/api/buzzes?lat=&lng=` | Active buzzes (mock or Firestore) |
| POST | `/api/buzzes` | Create buzz (Firebase Bearer token required) |

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | Listen port |
| `HOST` | `0.0.0.0` | Bind address (required for phone → PC on LAN) |
| `USE_MOCK` | `true` | `false` to read Firestore `buzzes` collection |
| `FIREBASE_PROJECT_ID` | — | Required when `USE_MOCK=false` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | — | Service account JSON string |

## Firestore `buzzes` document shape

```js
{
  type, title, lat, lng,
  zone?, teaser?, description?, host?,
  icon?, image?, isSecret?, password?,
  isVerifiedSource?,
  expiresAt: Timestamp  // must be in the future
}
```

If Firestore is unavailable or empty, the API falls back to the dynamic mock generator.
