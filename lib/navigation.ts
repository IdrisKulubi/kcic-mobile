import { router } from 'expo-router';

import type { ContentType } from '@/data/kcic';

export function openContent(type: ContentType, id: string) {
  router.push({
    pathname: '/content/[type]/[id]',
    params: { type, id },
  });
}

export function openSettings(slug: string) {
  router.push({
    pathname: '/settings/[slug]',
    params: { slug },
  });
}

export function openPodcastEpisode(episodeId: string) {
  router.push({
    pathname: '/(tabs)/podcasts',
    params: { episode: episodeId },
  });
}

export function openAskKcic() {
  router.push('/ask');
}

export function openNotificationLink(linkType: string, linkId: string) {
  if (linkType === 'podcast') {
    openPodcastEpisode(linkId);
    return;
  }
  openContent(linkType as ContentType, linkId);
}
