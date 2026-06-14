Firestore rules, indexes, and TTL

1) Firestore security rules
- File: `backend/firestore.rules` — starter rules restricting client access.

2) Indexes
- File: `backend/firestore.indexes.json` — composite indexes for geohash/creatorId queries. Deploy via `firebase deploy --only firestore:indexes` or use the console.

3) Enabling TTL
- We provide a script `backend/scripts/enable-ttl.js` which uses a service account JSON (set in `FIREBASE_SERVICE_ACCOUNT_JSON`) and `FIREBASE_PROJECT_ID` to enable TTL on `buzzes.expiresAt`.

Example usage:

```bash
export FIREBASE_PROJECT_ID=your-project-id
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
node backend/scripts/enable-ttl.js
```

Or use the gcloud fallback:

```bash
gcloud alpha firestore fields update --project=YOUR_PROJECT_ID --collection-group=buzzes --field=expiresAt --ttl
```

4) Deploy rules + indexes
- Install Firebase CLI and authenticate: `npm i -g firebase-tools && firebase login`
- From repo root, run:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

5) Notes & next steps
- Adjust rules for your frontend access patterns. The starter rules assume the backend is the authority; if frontend needs direct reads, update `allow read` conditions.
- Add retention/archival policy for `moderation_logs` (admin-only) if storing raw content.
