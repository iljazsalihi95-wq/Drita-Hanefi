/* Drita Hanefi • Hadith study session
 * One active audio element at a time, repeat/speed controls and durable progress.
 * Does not invent audio: a session starts only from a valid http(s) source.
 */
const VALID_SPEEDS = new Set([0.75, 1, 1.25, 1.5]);
const VALID_REPEATS = new Set([1, 3, 5, 10]);

function safeHttpUrl(value) {
  try {
    const u = new URL(String(value || ''), location.href);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
  } catch { return ''; }
}

function loadJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || '') || fallback; }
  catch { return fallback; }
}

export class HadithStudySession extends EventTarget {
  constructor({ storageKey = 'drita_hanefi_hadith_study_v1' } = {}) {
    super();
    this.storageKey = storageKey;
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.current = null;
    this.remaining = 0;
    this.repeatCount = 1;
    this.speed = 1;
    this.progress = loadJson(storageKey, { items: {} });
    this.audio.addEventListener('ended', () => this.#onEnded());
    this.audio.addEventListener('play', () => this.#emit('play'));
    this.audio.addEventListener('pause', () => this.#emit('pause'));
    this.audio.addEventListener('error', () => this.#emit('error'));
    this.audio.addEventListener('timeupdate', () => this.#savePosition());
  }

  select(hadith, preferredLanguage = 'arabic') {
    const audio = hadith?.audio || {};
    const primary = preferredLanguage === 'albanian' ? audio.albanian : audio.arabic;
    const fallback = preferredLanguage === 'albanian' ? audio.arabic : audio.albanian;
    const src = safeHttpUrl(primary) || safeHttpUrl(fallback);
    this.stop();
    this.current = hadith || null;
    if (!src || !hadith?.id) {
      this.audio.removeAttribute('src');
      this.#emit('unavailable');
      return false;
    }
    this.audio.src = src;
    this.audio.playbackRate = this.speed;
    const saved = this.progress.items?.[String(hadith.id)];
    if (saved?.position > 0) this.audio.currentTime = Number(saved.position) || 0;
    this.#emit('selected');
    return true;
  }

  async play() {
    if (!this.current || !safeHttpUrl(this.audio.src)) return false;
    this.remaining = Math.max(1, this.repeatCount);
    await this.audio.play();
    this.#markStarted();
    return true;
  }

  pause() { this.audio.pause(); }

  stop() {
    this.audio.pause();
    this.remaining = 0;
    try { this.audio.currentTime = 0; } catch {}
  }

  setSpeed(value) {
    const speed = Number(value);
    if (!VALID_SPEEDS.has(speed)) return false;
    this.speed = speed;
    this.audio.playbackRate = speed;
    this.#emit('speed');
    return true;
  }

  setRepeat(value) {
    const count = Number(value);
    if (!VALID_REPEATS.has(count)) return false;
    this.repeatCount = count;
    this.#emit('repeat');
    return true;
  }

  markLearned(id = this.current?.id) {
    if (!id) return;
    const item = this.#item(id);
    item.learned = true;
    item.learnedAt = new Date().toISOString();
    this.#persist();
    this.#emit('learned');
  }

  state(id = this.current?.id) {
    return id ? { ...this.#item(id) } : null;
  }

  #onEnded() {
    if (!this.current) return;
    const item = this.#item(this.current.id);
    item.completed = (item.completed || 0) + 1;
    item.position = 0;
    item.lastCompletedAt = new Date().toISOString();
    this.#persist();
    this.remaining -= 1;
    if (this.remaining > 0) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => { this.remaining = 0; this.#emit('error'); });
      this.#emit('repeat-progress');
      return;
    }
    this.#emit('complete');
  }

  #markStarted() {
    if (!this.current?.id) return;
    const item = this.#item(this.current.id);
    item.started = (item.started || 0) + 1;
    item.lastStartedAt = new Date().toISOString();
    this.#persist();
  }

  #savePosition() {
    if (!this.current?.id || !Number.isFinite(this.audio.currentTime)) return;
    const item = this.#item(this.current.id);
    item.position = Math.max(0, Math.floor(this.audio.currentTime));
    item.duration = Number.isFinite(this.audio.duration) ? Math.floor(this.audio.duration) : item.duration || 0;
    this.#persist(false);
  }

  #item(id) {
    this.progress.items ||= {};
    return (this.progress.items[String(id)] ||= {});
  }

  #persist(emit = true) {
    localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    if (emit) this.#emit('progress');
  }

  #emit(type) {
    this.dispatchEvent(new CustomEvent('change', { detail: {
      type,
      hadith: this.current,
      playing: !this.audio.paused,
      currentTime: this.audio.currentTime || 0,
      duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
      remaining: this.remaining,
      repeat: this.repeatCount,
      speed: this.speed,
      state: this.state()
    }}));
  }
}
