// state.js
export let currentView = "month";
export let currentDate = new Date();
export let dragEventId = null;
export let editingEventId = null;

export const calendarHooks = {
  onEventSave: null,
  onEventDelete: null,
  onEventOpen: null,
  filterEvents: null,
  transformEventDisplay: null
};

export function setView(v) {
  currentView = v;
}

export function setDate(d) {
  currentDate = d;
}

export function setDrag(id) {
  dragEventId = id;
}

export function setEditing(id) {
  editingEventId = id;
}

export function configureHooks(hooks = {}) {
  Object.assign(calendarHooks, hooks);
}
