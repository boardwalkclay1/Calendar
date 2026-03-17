// db.js
export const DEFAULT_DB_NAME = "RoyaltyRunnerDB";
export const DEFAULT_DB_VERSION = 5;
export const EVENTS_STORE = "events";

let db = null;
let dbConfig = {
  name: DEFAULT_DB_NAME,
  version: DEFAULT_DB_VERSION
};

export function configureDB({ dbName, dbVersion } = {}) {
  if (dbName) dbConfig.name = dbName;
  if (dbVersion) dbConfig.version = dbVersion;
}

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbConfig.name, dbConfig.version);

    request.onupgradeneeded = (e) => {
      db = e.target.result;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const store = db.createObjectStore(EVENTS_STORE, {
          keyPath: "id",
          autoIncrement: true
        });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("reminder", "reminder", { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };

    request.onerror = () => reject(new Error("Calendar DB failed."));
  });
}

export function getDB() {
  if (!db) throw new Error("DB not initialized. Call initDB() first.");
  return db;
}

export function openTx(store, mode = "readonly") {
  return getDB().transaction(store, mode).objectStore(store);
}

export function getAllEvents() {
  return new Promise((resolve) => {
    const store = openTx(EVENTS_STORE);
    const out = [];
    store.openCursor().onsuccess = (e) => {
      const c = e.target.result;
      if (!c) return resolve(out);
      out.push(c.value);
      c.continue();
    };
  });
}

export function saveEvent(ev) {
  return new Promise((resolve) => {
    const store = openTx(EVENTS_STORE, "readwrite");
    store.put(ev).onsuccess = () => resolve();
  });
}

export function deleteEvent(id) {
  return new Promise((resolve) => {
    const store = openTx(EVENTS_STORE, "readwrite");
    store.delete(id).onsuccess = () => resolve();
  });
}

export function getEventById(id) {
  return new Promise((resolve) => {
    const store = openTx(EVENTS_STORE);
    const req = store.get(id);
    req.onsuccess = (e) => resolve(e.target.result || null);
  });
}
