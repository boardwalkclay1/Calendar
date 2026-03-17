// render-week.js
import { getAllEvents } from "./db.js";
import { ymd, addDays, startOfWeek, sameDay, formatTimeRange } from "./utils.js";
import { currentDate, setDrag, calendarHooks } from "./state.js";
import { openEventModal } from "./modal.js";
import { moveEventToDate } from "./drag.js";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function renderWeek(grid, label, weekdayLabels) {
  grid.innerHTML = "";

  if (weekdayLabels) {
    weekdayLabels.innerHTML = weekdays.map((d) => `<div>${d}</div>`).join("");
  }

  const start = startOfWeek(currentDate);
  const end = addDays(start, 6);

  label.textContent =
    `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ` +
    `${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  getAllEvents().then((events) => {
    if (typeof calendarHooks.filterEvents === "function") {
      events = calendarHooks.filterEvents(events) || events;
    }

    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const ds = ymd(d);
      const evs = events.filter((ev) => ev.date === ds);

      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      if (sameDay(d, new Date())) cell.classList.add("today");
      cell.dataset.date = ds;

      cell.innerHTML = `
        <div class="calendar-cell-header">
          <span class="date-number">${d.getDate()}</span>
          <span>${weekdays[d.getDay()]}</span>
        </div>
        <div class="calendar-events"></div>
      `;

      const container = cell.querySelector(".calendar-events");

      evs
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
        .forEach((ev) => {
          const pill = document.createElement("div");
          pill.className = "calendar-event-pill";
          pill.draggable = true;
          pill.dataset.id = ev.id;

          const time = formatTimeRange(ev.startTime, ev.endTime);
          let labelText = time ? `${time} – ${ev.title}` : ev.title;

          if (typeof calendarHooks.transformEventDisplay === "function") {
            labelText =
              calendarHooks.transformEventDisplay(ev, { mode: "week", time }) ||
              labelText;
          }

          pill.textContent = labelText;

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
          renderWeek(grid, label, weekdayLabels);
        });
      });

      cell.addEventListener("click", () => openEventModal({ date: ds }, d));

      grid.appendChild(cell);
    }
  });
}
