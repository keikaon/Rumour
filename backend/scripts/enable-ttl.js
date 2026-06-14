const https = require('https');
const { GoogleAuth } = require('google-auth-library');

async function getAccessTokenFromServiceAccount(saJson) {
  const auth = new GoogleAuth({ credentials: saJson, scopes: ['https://www.googleapis.com/auth/datastore'] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token) throw new Error('Unable to acquire access token');
  return typeof token === 'string' ? token : token.token || token.access_token;
}

function patchTTL(projectId, accessToken, collectionId = 'buzzes', fieldPath = 'expiresAt') {
  return new Promise((resolve, reject) => {
    const path = `/v1/projects/${projectId}/databases/(default)/collectionGroups/${encodeURIComponent(
      collectionId
    )}/fields/${encodeURIComponent(fieldPath)}?updateMask=ttlConfig`;

    const body = JSON.stringify({ ttlConfig: { state: 'TTL_STATE_ENABLED' } });

    const options = {
      host: 'firestore.googleapis.com',
      path,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data || '{}'));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error('Set FIREBASE_PROJECT_ID env var.');
    process.exit(1);
  }

  let saJson = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      saJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON');
      process.exit(1);
    }
  }

  if (!saJson) {
    console.error('Provide service account JSON in FIREBASE_SERVICE_ACCOUNT_JSON env var.');
    process.exit(1);
  }

  try {
    const token = await getAccessTokenFromServiceAccount(saJson);
    console.log('Acquired access token, enabling TTL...');
    const resp = await patchTTL(projectId, token, 'buzzes', 'expiresAt');
    console.log('TTL enabled:', JSON.stringify(resp, null, 2));
  } catch (err) {
    console.error('Failed to enable TTL:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) main();

// Fallback/gcloud hint:
// gcloud alpha firestore fields update --project=YOUR_PROJECT_ID --collection-group=buzzes --field=expiresAt --ttl
