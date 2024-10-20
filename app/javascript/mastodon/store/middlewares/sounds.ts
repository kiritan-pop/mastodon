import { isAction } from '@reduxjs/toolkit';
import type { Middleware, UnknownAction } from '@reduxjs/toolkit';

import ready from 'mastodon/ready';
import { assetHost } from 'mastodon/utils/config';

import type { RootState } from '..';

interface AudioSource {
  src: string;
  type: string;
  vol: number;
}

interface ActionWithMetaSound extends UnknownAction {
  meta: { sound: string };
}

function isActionWithMetaSound(action: unknown): action is ActionWithMetaSound {
  return (
    isAction(action) &&
    'meta' in action &&
    typeof action.meta === 'object' &&
    !!action.meta &&
    'sound' in action.meta &&
    typeof action.meta.sound === 'string'
  );
}

const createAudio = (sources: AudioSource[]) => {
  const audio = new Audio();
  sources.forEach(({ type, src, vol }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
    audio.volume = vol;
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

export const soundsMiddleware = (): Middleware<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- we need to use `{}` here to ensure the dispatch types can be merged
  {},
  RootState
> => {
  const soundCache: Record<string, HTMLAudioElement> = {};

  void ready(() => {
    soundCache.boop = createAudio([
      {
        src: `${assetHost}/sounds/boop.ogg`,
        type: 'audio/ogg',
        vol: 1.0,
      },
      {
        src: `${assetHost}/sounds/boop.mp3`,
        type: 'audio/mpeg',
        vol: 1.0,
      },
    ]);

    soundCache.nade = createAudio([
      {
        src: `${assetHost}/sounds/nade.ogg`,
        type: 'audio/ogg',
        vol: 0.7,
      },
      {
        src: `${assetHost}/sounds/nade.mp3`,
        type: 'audio/mpeg',
        vol: 0.7,
      },
    ]);

    soundCache.faaa = createAudio([
      {
        src: `${assetHost}/sounds/faaa.ogg`,
        type: 'audio/ogg',
        vol: 0.5,
      },
      {
        src: `${assetHost}/sounds/faaa.mp3`,
        type: 'audio/mpeg',
        vol: 0.5,
      },
    ]);

    soundCache.dosa = createAudio([
      {
        src: `${assetHost}/sounds/dosa.ogg`,
        type: 'audio/ogg',
        vol: 0.8,
      },
      {
        src: `${assetHost}/sounds/dosa.mp3`,
        type: 'audio/mpeg',
        vol: 0.8,
      },
    ]);

    soundCache.tett = createAudio([
      {
        src: `${assetHost}/sounds/tett.ogg`,
        type: 'audio/ogg',
        vol: 0.7,
      },
      {
        src: `${assetHost}/sounds/tett.mp3`,
        type: 'audio/mpeg',
        vol: 0.7,
      },
    ]);

    soundCache.nank = createAudio([
      {
        src: `${assetHost}/sounds/nank.ogg`,
        type: 'audio/ogg',
        vol: 0.8,
      },
      {
        src: `${assetHost}/sounds/nank.mp3`,
        type: 'audio/mpeg',
        vol: 0.8,
      },
    ]);

    soundCache.bbhr = createAudio([
      {
        src: `${assetHost}/sounds/bbhr.ogg`,
        type: 'audio/ogg',
        vol: 0.8,
      },
      {
        src: `${assetHost}/sounds/bbhr.mp3`,
        type: 'audio/mpeg',
        vol: 0.8,
      },
    ]);

    soundCache.prpr = createAudio([
      {
        src: `${assetHost}/sounds/prpr.ogg`,
        type: 'audio/ogg',
        vol: 0.8,
      },
      {
        src: `${assetHost}/sounds/prpr.mp3`,
        type: 'audio/mpeg',
        vol: 0.8,
      },
    ]);

    soundCache.jan = createAudio([
      {
        src: `${assetHost}/sounds/jan.ogg`,
        type: 'audio/ogg',
        vol: 0.5,
      },
      {
        src: `${assetHost}/sounds/jan.mp3`,
        type: 'audio/mpeg',
        vol: 0.5,
      },
    ]);
  });

  return () => (next) => (action) => {
    if (isActionWithMetaSound(action)) {
      const sound = action.meta.sound;

      if (sound) {
        const s = soundCache[sound];
        if (s) play(s);
      }
    }

    return next(action);
  };
};
