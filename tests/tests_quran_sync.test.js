const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAyahIndex,
  findAyahByTime,
  getSavedPosition,
  initQuranSync,
  savePosition,
  storageKey
} = require('../src/quran-sync.js');

class MemoryStorage {
  constructor() {
    this.items = new Map();
  }
  getItem(key) {
    return this.items.has(key) ? this.items.get(key) : null;
  }
  setItem(key, value) {
    this.items.set(key, String(value));
  }
}

class FakeClassList {
  constructor() {
    this.values = new Set();
  }
  add(...names) {
    names.forEach((name) => this.values.add(name));
  }
  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }
  contains(name) {
    return this.values.has(name);
  }
}

function fakeAyah(dataset) {
  return {
    dataset,
    classList: new FakeClassList(),
    scrollIntoViewCalled: 0,
    scrollIntoView() {
      this.scrollIntoViewCalled += 1;
    }
  };
}

function fakeAudio() {
  const listeners = new Map();
  return {
    currentTime: 0,
    duration: 120,
    playbackRate: 1,
    paused: true,
    addEventListener(type, handler) {
      listeners.set(type, [...(listeners.get(type) || []), handler]);
    },
    removeEventListener(type, handler) {
      listeners.set(type, (listeners.get(type) || []).filter((item) => item !== handler));
    },
    dispatch(type) {
      (listeners.get(type) || []).forEach((handler) => handler({ type }));
    },
    play() {
      this.paused = false;
      this.dispatch('play');
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
      this.dispatch('pause');
    }
  };
}

test('buildAyahIndex reads explicit data-start/data-end mappings', () => {
  const elements = [
    fakeAyah({ sura: 'sura_1', ayah: '1', start: '0', end: '4.5' }),
    fakeAyah({ sura: 'sura_1', ayah: '2', start: '4.5', end: '9' })
  ];

  const index = buildAyahIndex(elements, 'sura_1');

  assert.equal(index.length, 2);
  assert.equal(index[1].ayah, 2);
  assert.equal(findAyahByTime(index, 5).ayah, 2);
});

test('buildAyahIndex falls back to cumulative per-ayah durations', () => {
  const elements = [
    fakeAyah({ ayah: '1', duration: '3' }),
    fakeAyah({ ayah: '2', duration: '4' })
  ];

  const index = buildAyahIndex(elements, 'sura_2');

  assert.deepEqual(index.map(({ start, end }) => [start, end]), [[0, 3], [3, 7]]);
  assert.equal(findAyahByTime(index, 6.5).ayah, 2);
});

test('resume positions are scoped by reciter and sura and ignore near bounds', () => {
  const storage = new MemoryStorage();

  savePosition('r1', 'sura_1', 12, storage);
  savePosition('r2', 'sura_1', 40, storage);
  savePosition('r1', 'sura_2', 60, storage);
  storage.setItem(storageKey('r1', 'sura_3'), JSON.stringify({ time: 99.2, updated: Date.now() }));

  assert.equal(getSavedPosition('r1', 'sura_1', 100, storage), 12);
  assert.equal(getSavedPosition('r2', 'sura_1', 100, storage), 40);
  assert.equal(getSavedPosition('r1', 'sura_2', 100, storage), 60);
  assert.equal(getSavedPosition('r1', 'sura_3', 100, storage), null);

  savePosition('r1', 'sura_4', 0.7, storage);
  assert.equal(getSavedPosition('r1', 'sura_4', 100, storage), null);
});

test('initQuranSync resumes on play and highlights the current ayah', async () => {
  const elements = [
    fakeAyah({ ayah: '1', start: '0', end: '10' }),
    fakeAyah({ ayah: '2', start: '10', end: '20' })
  ];
  const previousDocument = global.document;
  const previousWindow = global.window;
  const storage = new MemoryStorage();

  global.document = {
    title: 'Quran test',
    querySelectorAll: () => elements,
    addEventListener() {},
    removeEventListener() {}
  };
  global.window = {
    addEventListener() {},
    removeEventListener() {},
    setInterval,
    clearInterval
  };

  try {
    savePosition('reciter-a', 'sura_1', 12, storage);
    const audio = fakeAudio();
    const api = initQuranSync({ audioEl: audio, reciterId: 'reciter-a', suraId: 'sura_1', storage });

    await audio.play();
    audio.dispatch('timeupdate');

    assert.equal(audio.currentTime, 12);
    assert.equal(api.getCurrentActive(), elements[1]);
    assert.equal(elements[1].classList.contains('active-ayah'), true);

    api.destroy();
  } finally {
    global.document = previousDocument;
    global.window = previousWindow;
  }
});
