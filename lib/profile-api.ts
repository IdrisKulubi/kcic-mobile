import type { AuthUser } from '@/lib/auth-helpers';
import { apiFetch } from '@/lib/api-client';

export type ProfileUpdatePayload = {
  name?: string;
  organization?: string | null;
  location?: string | null;
  interests?: string[];
};

export async function updateProfile(payload: ProfileUpdatePayload) {
  const response = await apiFetch<{ user: AuthUser }>('/api/user/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return response.user;
}
