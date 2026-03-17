// render-agenda.js
import { getAllEvents, deleteEvent } from "./db.js";
import { ymd, parseYMD, formatTimeRange } from "./utils.js";
import { calendarHooks } from "./state.js";
import { getEventById } from "./db.js";
import { openEventModal } from "./modal.js";

export function renderAgenda(agendaElement, rerenderFn) {
  if (!agendaElement) return;

  getAllEvents().then((events) => {
    const today = ymd(new Date());

    if (typeof calendarHooks.filterEvents === "function") {
      events = calendarHooks.filterEvents(events) || events;
    }

    const upcoming = events
      .filter((ev) => ev.date >= today)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.startTime || "").localeCompare(b.startTime || "")
      );

    agendaElement.innerHTML = "";

    if (!upcoming.length) {
      agendaElement.innerHTML = `<p style="opacity:0.7;">No events yet.</p>`;
      return;
    }

    upcoming.forEach((ev) => {
      const d = parseYMD(ev.date);
      const item = document.createElement("div");
      item.className = "agenda-item";

      const timeLabel = formatTimeRange(ev.startTime, ev.endTime) || "All day";

      item.innerHTML = `
        <div class="agenda-main">
          <div class="agenda-title">${ev.title}</div>
          <div class="agenda-meta">
            ${d.toLocaleDateString()} • ${timeLabel} • ${ev.type || "general"}
          </div>
        </div>
        <div class="agenda-actions">
          <button class="agenda-edit" data-id="${ev.id}">Edit</button>
          <button class="agenda-delete" data-id="${ev.id}">Delete</button>
        </div>
      `;

      agendaElement.appendChild(item);
    });

    agendaElement.querySelectorAll(".agenda-edit").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        const ev = await getEventById(id);
        if (ev) openEventModal(ev, new Date(ev.date));
      });
    });

    agendaElement.querySelectorAll(".agenda-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        deleteEvent(id).then(() => {
          if (typeof calendarHooks.onEventDelete === "function") {
            calendarHooks.onEventDelete(id);
          }
          rerenderFn();
        });
      });
    });
  });
}
