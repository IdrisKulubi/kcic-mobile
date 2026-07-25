import { apiFetch, ApiAuthError } from '@/lib/api-client';

type SavedKeysResponse = {
  keys: string[];
};

type ToggleSavedResponse = {
  saved: boolean;
};

export async function fetchSavedKeys(): Promise<string[]> {
  const data = await apiFetch<SavedKeysResponse>('/api/user/saved');
  return data.keys ?? [];
}

export async function toggleSavedKey(itemKey: string): Promise<ToggleSavedResponse> {
  return apiFetch<ToggleSavedResponse>('/api/user/saved/toggle', {
    method: 'POST',
    body: JSON.stringify({ itemKey }),
  });
}

export function isSavedSyncError(error: unknown) {
  return error instanceof ApiAuthError;
}
