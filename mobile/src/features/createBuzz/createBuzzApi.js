import { auth } from '../../../firebase';

export async function postCreateBuzz(backendUrl, payload) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to start a signal.');
  }

  const token = await user.getIdToken();
  const response = await fetch(`${backendUrl}/api/buzzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.moderationReason || data.error || `HTTP ${response.status}`);
    err.moderationReason = data.moderationReason;
    err.categories = data.categories;
    throw err;
  }

  return data.buzz;
}
