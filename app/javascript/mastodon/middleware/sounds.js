const createAudio = sources => {
  const audio = new Audio();
  sources.forEach(({ type, src, vol }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
    audio.volume = vol
  });
  return audio;
};

const play = audio => {
  if (!audio.paused) {
    audio.pause();
    if (typeof audio.fastSeek === 'function') {
      audio.fastSeek(0);
    } else {
      audio.currentTime = 0;
    }
  }

  audio.play();
};

export default function soundsMiddleware() {
  const soundCache = {
    boop: createAudio([
      {
        src: '/sounds/boop.ogg',
        type: 'audio/ogg',
        vol: 1.0,
      },
      {
        src: '/sounds/boop.mp3',
        type: 'audio/mpeg',
        vol: 1.0,
      },
    ]),
    nade: createAudio([
      {
        src: '/sounds/nade.ogg',
        type: 'audio/ogg',
        vol: 0.7,
      },
      {
        src: '/sounds/nade.mp3',
        type: 'audio/mpeg',
        vol: 0.7,
      },
    ]),
    faaa: createAudio([
      {
        src: '/sounds/faaa.ogg',
        type: 'audio/ogg',
        vol: 0.5,
      },
      {
        src: '/sounds/faaa.mp3',
        type: 'audio/mpeg',
        vol: 0.5,
      },
    ]),
    dosa: createAudio([
      {
        src: '/sounds/dosa.ogg',
        type: 'audio/ogg',
        vol: 0.9,
      },
      {
        src: '/sounds/dosa.mp3',
        type: 'audio/mpeg',
        vol: 0.9,
      },
    ]),
    tett: createAudio([
      {
        src: '/sounds/tett.ogg',
        type: 'audio/ogg',
        vol: 0.7,
      },
      {
        src: '/sounds/tett.mp3',
        type: 'audio/mpeg',
        vol: 0.7,
      },
    ]),
    nank: createAudio([
      {
        src: '/sounds/nank.ogg',
        type: 'audio/ogg',
        vol: 0.9,
      },
      {
        src: '/sounds/nank.mp3',
        type: 'audio/mpeg',
        vol: 0.9,
      },
    ]),
    bbhr: createAudio([
      {
        src: '/sounds/bbhr.ogg',
        type: 'audio/ogg',
        vol: 1.0,
      },
      {
        src: '/sounds/bbhr.mp3',
        type: 'audio/mpeg',
        vol: 1.0,
      },
    ]),
    prpr: createAudio([
      {
        src: '/sounds/prpr.ogg',
        type: 'audio/ogg',
        vol: 1.0,
      },
      {
        src: '/sounds/prpr.mp3',
        type: 'audio/mpeg',
        vol: 1.0,
      },
    ]),
    jan: createAudio([
      {
        src: '/sounds/jan.ogg',
        type: 'audio/ogg',
        vol: 0.6,
      },
      {
        src: '/sounds/jan.mp3',
        type: 'audio/mpeg',
        vol: 0.6,
      },
    ]),  };

  return () => next => action => {
    if (action.meta && action.meta.sound && soundCache[action.meta.sound]) {
      play(soundCache[action.meta.sound]);
    }

    return next(action);
  };
};
