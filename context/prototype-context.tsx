import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { notifications as initialNotifications, type AppNotification } from '@/data/kcic';

const DEFAULT_INTERESTS = [
  'AgTech Innovations',
  'Renewable Energy',
  'Circular Economy',
  'Climate Finance',
];

type PrototypeContextValue = {
  bookmarks: Set<string>;
  rsvpEvents: Set<string>;
  interests: string[];
  notificationRead: Set<string>;
  hasUnreadNotifications: boolean;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  toggleRsvp: (eventId: string) => boolean;
  isRsvped: (eventId: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addInterest: (topic: string) => void;
  removeInterest: (topic: string) => void;
  notifications: AppNotification[];
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [rsvpEvents, setRsvpEvents] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<string[]>(DEFAULT_INTERESTS);
  const [notificationRead, setNotificationRead] = useState<Set<string>>(new Set());

  const toggleBookmark = useCallback((key: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((key: string) => bookmarks.has(key), [bookmarks]);

  const toggleRsvp = useCallback((eventId: string) => {
    let added = false;
    setRsvpEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        added = false;
      } else {
        next.add(eventId);
        added = true;
      }
      return next;
    });
    return added;
  }, []);

  const isRsvped = useCallback((eventId: string) => rsvpEvents.has(eventId), [rsvpEvents]);

  const markNotificationRead = useCallback((id: string) => {
    setNotificationRead((prev) => new Set(prev).add(id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotificationRead(new Set(initialNotifications.map((n) => n.id)));
  }, []);

  const addInterest = useCallback((topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed) return;
    setInterests((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }, []);

  const removeInterest = useCallback((topic: string) => {
    setInterests((prev) => prev.filter((t) => t !== topic));
  }, []);

  const hasUnreadNotifications = useMemo(
    () => initialNotifications.some((n) => !notificationRead.has(n.id)),
    [notificationRead]
  );

  const value = useMemo(
    () => ({
      bookmarks,
      rsvpEvents,
      interests,
      notificationRead,
      hasUnreadNotifications,
      toggleBookmark,
      isBookmarked,
      toggleRsvp,
      isRsvped,
      markNotificationRead,
      markAllNotificationsRead,
      addInterest,
      removeInterest,
      notifications: initialNotifications,
    }),
    [
      bookmarks,
      rsvpEvents,
      interests,
      notificationRead,
      hasUnreadNotifications,
      toggleBookmark,
      isBookmarked,
      toggleRsvp,
      isRsvped,
      markNotificationRead,
      markAllNotificationsRead,
      addInterest,
      removeInterest,
    ]
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error('usePrototype must be used within PrototypeProvider');
  return ctx;
}
