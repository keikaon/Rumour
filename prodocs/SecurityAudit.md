# Security Audit — Immediate Actions

This file lists high-priority security items to address before pushing the repo public or creating a release.

Findings
- `backend/.env` currently contains a full `FIREBASE_SERVICE_ACCOUNT_JSON` value (including private key) and `GOOGLE_AI_API_KEY`.
- Committed secrets are high-risk: service account private keys and API keys must not be in a public repo.

Immediate recommended actions (one-time)
1. Remove secrets from the repository history and working tree:
   - Create a local backup of `backend/.env` if needed.
   - Run:
     ```bash
     git rm --cached backend/.env
     git rm --cached backend/serviceAccountKey.json || true
     git commit -m "chore(secrets): remove env and service account from repo"
     ```
   - Use `git filter-repo` or BFG repo-cleaner to remove secrets from history if they were previously committed and the repo is public.
2. Add secrets to the host or CI secret store instead of files. Use environment variables in deployment.
3. Ensure `.gitignore` contains `backend/.env` and `backend/serviceAccountKey.json` (done).

What to push to GitHub
- Push code, docs, and `*.example` env files only. Keep real secrets local or stored in CI.
- Confirm with `git status` that `backend/.env` is not staged.

Verification steps
- After the removal commit, run `git log -- backend/.env` to check prior commits.
- If secrets were exposed on a public remote, rotate the compromised credentials immediately (create new service account keys, revoke old ones, rotate AI keys).

Dev conveniences
- Provide an `.env.example` with placeholders (already present). In CI, add `FIREBASE_SERVICE_ACCOUNT_JSON` as a secret and inject it at runtime.

Contact & Help
- If you'd like, I can generate a small script to extract `FIREBASE_SERVICE_ACCOUNT_JSON` from `.env` into `serviceAccountKey.json` for local dev and then add that file to `.gitignore` (so it stays local). I previously provided PowerShell commands to do this.
