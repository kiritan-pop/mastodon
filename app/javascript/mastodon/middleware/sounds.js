const createAudio = sources => {
  const audio = new Audio();
  sources.forEach(({ type, src }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
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

  audio.volume = 0.7;
  audio.play();
};

export default function soundsMiddleware() {
  const soundCache = {
    boop: createAudio([
      {
        src: '/sounds/boop.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/boop.mp3',
        type: 'audio/mpeg',
      },
    ]),
    nade: createAudio([
      {
        src: '/sounds/nade.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/nade.mp3',
        type: 'audio/mpeg',
      },
    ]),
    faaa: createAudio([
      {
        src: '/sounds/faaa.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/faaa.mp3',
        type: 'audio/mpeg',
      },
    ]),
    dosa: createAudio([
      {
        src: '/sounds/dosa.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/dosa.mp3',
        type: 'audio/mpeg',
      },
    ]),
    tett: createAudio([
      {
        src: '/sounds/tett.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/tett.mp3',
        type: 'audio/mpeg',
      },
    ]),
    nank: createAudio([
      {
        src: '/sounds/nank.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/nank.mp3',
        type: 'audio/mpeg',
      },
    ]),
    bbhr: createAudio([
      {
        src: '/sounds/bbhr.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/bbhr.mp3',
        type: 'audio/mpeg',
      },
    ]),
    prpr: createAudio([
      {
        src: '/sounds/prpr.ogg',
        type: 'audio/ogg',
      },
      {
        src: '/sounds/prpr.mp3',
        type: 'audio/mpeg',
      },
    ]),
  };

  return () => next => action => {
    if (action.meta && action.meta.sound && soundCache[action.meta.sound]) {
      play(soundCache[action.meta.sound]);
    }

    return next(action);
  };
};
