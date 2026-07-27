import * as SecureStore from 'expo-secure-store';

export type NotificationPreferenceKey =
  | 'emailDigests'
  | 'pushAlerts'
  | 'eventReminders'
  | 'podcastReleases';

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

const STORAGE_PREFIX = 'kcic_notification_prefs';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailDigests: true,
  pushAlerts: true,
  eventReminders: true,
  podcastReleases: false,
};

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export async function loadNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const raw = await SecureStore.getItemAsync(storageKey(userId));
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export async function saveNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
) {
  await SecureStore.setItemAsync(storageKey(userId), JSON.stringify(preferences));
}
