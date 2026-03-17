// drag.js
import { openTx, saveEvent, EVENTS_STORE } from "./db.js";
import { setDrag } from "./state.js";

export function moveEventToDate(id, newDate, onAfterMove) {
  const store = openTx(EVENTS_STORE, "readwrite");
  const req = store.get(id);
  req.onsuccess = (e) => {
    const ev = e.target.result;
    if (!ev) return;
    ev.date = newDate;
    saveEvent(ev).then(() => {
      setDrag(null);
      if (typeof onAfterMove === "function") onAfterMove();
    });
  };
}
