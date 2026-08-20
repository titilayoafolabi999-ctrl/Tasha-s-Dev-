

const State = (function() {
  'use strict';

  const store = new Map();
  const listeners = new Map();

  function set(key, value) {
    store.set(key, value);
    notify(key, value);
  }

  function get(key, defaultValue) {
    return store.has(key) ? store.get(key) : defaultValue;
  }

  function remove(key) {
    store.delete(key);
    notify(key, undefined);
  }

  function subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(callback);

    return () => listeners.get(key).delete(callback);
  }

  function notify(key, value) {
    if (listeners.has(key)) {
      listeners.get(key).forEach(cb => {
        try { cb(value, key); } catch (e) { console.error(e); }
      });
    }
  }

  function clear() {
    store.clear();
    listeners.clear();
  }

  return { set, get, remove, subscribe, clear };
})();
