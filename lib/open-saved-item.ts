import { showOpenResource } from '@/components/kcic/feedback';
import { hapticLight } from '@/lib/haptics';
import type { MediaItem } from '@/lib/media-api';
import { openContent, openPodcastEpisode } from '@/lib/navigation';

import type { SavedItem } from './resolve-saved-items';

type OpenSavedItemOptions = {
  getMediaItem: (id: string) => MediaItem | undefined;
  playMedia: (item: MediaItem) => void;
};

export function openSavedItem(item: SavedItem, options: OpenSavedItemOptions) {
  hapticLight();

  if (item.type === 'resource') {
    showOpenResource(item.title, item.resourceDetail ?? item.meta);
    return;
  }

  if (item.type === 'podcast') {
    const mediaItem = options.getMediaItem(item.id);
    if (mediaItem) {
      options.playMedia(mediaItem);
      return;
    }
    openPodcastEpisode(item.id);
    return;
  }

  openContent(item.type, item.id);
}
