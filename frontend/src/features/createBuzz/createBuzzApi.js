import { auth } from "../../firebase";

export async function postCreateBuzz(payload, backendUrl = "") {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to start a signal.");
  }

  // 🌐 Fallback to the environment variable if backendUrl wasn't passed down
  const finalBackendUrl = backendUrl || import.meta.env.VITE_API_URL || "";
  const baseUrl = finalBackendUrl ? finalBackendUrl.replace(/\/$/, "") : "";

  const token = await user.getIdToken();
  const response = await fetch(`${baseUrl}/api/buzzes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(
      data.moderationReason || data.error || `HTTP ${response.status}`,
    );
    err.moderationReason = data.moderationReason;
    err.categories = data.categories;
    throw err;
  }

  // Backend returns the buzz directly, not wrapped in { buzz: ... }
  return data;
}
