import { useCallback, useState } from "react";
import { DEFAULT_FORM } from "./createBuzzTypes";
import { postCreateBuzz } from "./createBuzzApi";

export default function useCreateBuzz({ location, onSuccess }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...DEFAULT_FORM });
    setError("");
  }, []);

  const submit = useCallback(async () => {
    if (!location) {
      setError("Location required. Enable GPS to start a signal.");
      return false;
    }

    setSubmitting(true);
    setError("");

    try {
      const createdBuzz = await postCreateBuzz({
        ...form,
        lat: location.lat,
        lng: location.lng,
        userLat: location.lat,
        userLng: location.lng,
        password: form.isSecret ? form.password : null,
      });
      console.log("[CreateBuzz] Successfully created buzz:", createdBuzz?.id);
      resetForm();
      onSuccess?.();
      return true;
    } catch (err) {
      setError(
        err.moderationReason || err.message || "Failed to publish signal.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [form, location, onSuccess, resetForm]);

  return { form, updateField, resetForm, submit, submitting, error };
}
