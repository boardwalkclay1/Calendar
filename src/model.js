// modal.js
import { ymd } from "./utils.js";
import { saveEvent, deleteEvent } from "./db.js";
import { editingEventId, setEditing, calendarHooks } from "./state.js";

let modal,
  modalTitle,
  modalDate,
  modalStart,
  modalEnd,
  modalType,
  modalNotes,
  modalReminder,
  modalCancel,
  modalDelete,
  modalSave;

let rerenderFn = () => {};

export function initModal(options) {
  const {
    modalElement,
    titleInput,
    dateInput,
    startInput,
    endInput,
    typeSelect,
    notesTextarea,
    reminderCheckbox,
    cancelButton,
    deleteButton,
    saveButton,
    onRerender
  } = options;

  modal = modalElement;
  modalTitle = titleInput;
  modalDate = dateInput;
  modalStart = startInput;
  modalEnd = endInput;
  modalType = typeSelect;
  modalNotes = notesTextarea;
  modalReminder = reminderCheckbox;
  modalCancel = cancelButton;
  modalDelete = deleteButton;
  modalSave = saveButton;
  rerenderFn = onRerender || (() => {});

  modalCancel.addEventListener("click", closeEventModal);

  modalDelete.addEventListener("click", () => {
    if (!editingEventId) return closeEventModal();
    deleteEvent(editingEventId).then(() => {
      if (typeof calendarHooks.onEventDelete === "function") {
        calendarHooks.onEventDelete(editingEventId);
      }
      closeEventModal();
      rerenderFn();
    });
  });

  modalSave.addEventListener("click", () => {
    const ev = {
      id: editingEventId || undefined,
      title: modalTitle.value.trim() || "(Untitled Event)",
      date: modalDate.value,
      startTime: modalStart.value || "",
      endTime: modalEnd.value || "",
      type: modalType.value || "general",
      notes: modalNotes.value || "",
      reminder: modalReminder.checked
    };

    saveEvent(ev).then(() => {
      if (typeof calendarHooks.onEventSave === "function") {
        calendarHooks.onEventSave(ev);
      }
      closeEventModal();
      rerenderFn();
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeEventModal();
  });
}

export function openEventModal(ev, currentDate) {
  setEditing(ev.id || null);

  modalTitle.value = ev.title || "";
  modalDate.value = ev.date || ymd(currentDate || new Date());
  modalStart.value = ev.startTime || "";
  modalEnd.value = ev.endTime || "";
  modalType.value = ev.type || "general";
  modalNotes.value = ev.notes || "";
  modalReminder.checked = !!ev.reminder;

  modal.style.display = "flex";
  modalDelete.style.display = ev.id ? "inline-block" : "none";

  if (typeof calendarHooks.onEventOpen === "function") {
    calendarHooks.onEventOpen(ev);
  }
}

export function closeEventModal() {
  if (!modal) return;
  modal.style.display = "none";
  setEditing(null);
}
