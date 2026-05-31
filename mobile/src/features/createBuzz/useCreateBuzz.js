import { useCallback, useState } from 'react';
import { DEFAULT_FORM } from './createBuzzTypes';
import { postCreateBuzz } from './createBuzzApi';

export default function useCreateBuzz({ backendUrl, location, onSuccess }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...DEFAULT_FORM });
    setError('');
  }, []);

  const submit = useCallback(async () => {
    if (!location) {
      setError('Location required. Enable GPS to start a signal.');
      return false;
    }

    setSubmitting(true);
    setError('');

    try {
      await postCreateBuzz(backendUrl, {
        ...form,
        lat: location.latitude,
        lng: location.longitude,
        userLat: location.latitude,
        userLng: location.longitude,
        password: form.isSecret ? form.password : null,
      });
      resetForm();
      onSuccess?.();
      return true;
    } catch (err) {
      setError(err.moderationReason || err.message || 'Failed to publish signal.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [backendUrl, form, location, onSuccess, resetForm]);

  return {
    form,
    updateField,
    resetForm,
    submit,
    submitting,
    error,
    setError,
  };
}
