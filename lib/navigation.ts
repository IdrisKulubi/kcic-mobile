import { router } from 'expo-router';

export type NavigableContentType =
  | 'article'
  | 'story'
  | 'event'
  | 'programme'
  | 'opportunity';

export function openContent(type: NavigableContentType, id: string) {
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
  openContent(linkType as NavigableContentType, linkId);
}
