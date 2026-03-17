// render-month.js
import { getAllEvents } from "./db.js";
import { ymd, addDays, startOfWeek, sameDay } from "./utils.js";
import { currentDate, setDrag, calendarHooks } from "./state.js";
import { openEventModal } from "./modal.js";
import { moveEventToDate } from "./drag.js";

export function renderMonth(grid, label) {
  grid.innerHTML = "";

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);
  const start = startOfWeek(first);

  label.textContent = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  getAllEvents().then((events) => {
    if (typeof calendarHooks.filterEvents === "function") {
      events = calendarHooks.filterEvents(events) || events;
    }

    for (let i = 0; i < 42; i++) {
      const d = addDays(start, i);
      const ds = ymd(d);
      const evs = events.filter((ev) => ev.date === ds);

      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      if (sameDay(d, new Date())) cell.classList.add("today");
      if (d.getMonth() !== m) cell.style.opacity = 0.4;

      cell.dataset.date = ds;

      cell.innerHTML = `
        <div class="calendar-cell-header">
          <span class="date-number">${d.getDate()}</span>
        </div>
        <div class="calendar-events"></div>
      `;

      const container = cell.querySelector(".calendar-events");

      evs.forEach((ev) => {
        const pill = document.createElement("div");
        pill.className = "calendar-event-pill";
        pill.draggable = true;
        pill.dataset.id = ev.id;

        let title = ev.title || "(Untitled)";
        if (typeof calendarHooks.transformEventDisplay === "function") {
          title = calendarHooks.transformEventDisplay(ev, { mode: "month" }) || title;
        }

        pill.textContent = title;

        pill.addEventListener("dragstart", () => {
          setDrag(ev.id);
        });

        pill.addEventListener("click", (e) => {
          e.stopPropagation();
          openEventModal(ev, d);
        });

        container.appendChild(pill);
      });

      cell.addEventListener("dragover", (e) => e.preventDefault());
      cell.addEventListener("drop", () => {
        moveEventToDate(Number(window.dragEventId || 0), ds, () => {
          renderMonth(grid, label);
        });
      });

      cell.addEventListener("click", () => openEventModal({ date: ds }, d));

      grid.appendChild(cell);
    }
  });
}
