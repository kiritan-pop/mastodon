import type { Middleware, AnyAction } from 'redux';

import ready from 'mastodon/ready';
import { assetHost } from 'mastodon/utils/config';

import type { RootState } from '..';

interface AudioSource {
  src: string;
  type: string;
}

const createAudio = (sources: AudioSource[]) => {
  const audio = new Audio();
  sources.forEach(({ type, src }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
  });
  return audio;
};

const play = (audio: HTMLAudioElement) => {
  if (!audio.paused) {
    audio.pause();
    if (typeof audio.fastSeek === 'function') {
      audio.fastSeek(0);
    } else {
      audio.currentTime = 0;
    }
  }

  void audio.play();
};

export const soundsMiddleware = (): Middleware<unknown, RootState> => {
  const soundCache: Record<string, HTMLAudioElement> = {};

  void ready(() => {
    soundCache.boop = createAudio([
      {
        src: `${assetHost}/sounds/boop.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/boop.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.nade = createAudio([
      {
        src: `${assetHost}/sounds/nade.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/nade.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.faaa = createAudio([
      {
        src: `${assetHost}/sounds/faaa.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/faaa.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.dosa = createAudio([
      {
        src: `${assetHost}/sounds/dosa.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/dosa.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.tett = createAudio([
      {
        src: `${assetHost}/sounds/tett.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/tett.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.nank = createAudio([
      {
        src: `${assetHost}/sounds/nank.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/nank.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.bbhr = createAudio([
      {
        src: `${assetHost}/sounds/bbhr.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/bbhr.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.prpr = createAudio([
      {
        src: `${assetHost}/sounds/prpr.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/prpr.mp3`,
        type: 'audio/mpeg',
      },
    ]);

    soundCache.jan = createAudio([
      {
        src: `${assetHost}/sounds/jan.ogg`,
        type: 'audio/ogg',
      },
      {
        src: `${assetHost}/sounds/jan.mp3`,
        type: 'audio/mpeg',
      },
    ]);
  });

  return () =>
    (next) =>
    (action: AnyAction & { meta?: { sound?: string } }) => {
      const sound = action.meta?.sound;

      if (sound && Object.hasOwn(soundCache, sound)) {
        play(soundCache[sound]);
      }

      return next(action);
    };
};
