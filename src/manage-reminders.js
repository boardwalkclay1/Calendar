// manage-reminders.js
import { getAllEvents } from "./db.js";
import { ymd, parseYMD, formatTimeRange } from "./utils.js";

export function initManageReminders({ container }) {
  if (!container) return;

  getAllEvents().then((events) => {
    const today = ymd(new Date());

    const upcoming = events
      .filter((ev) => ev.reminder && ev.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);

    container.innerHTML = "";

    if (!upcoming.length) {
      container.innerHTML = `<p style="opacity:0.7;">No reminders yet.</p>`;
      return;
    }

    upcoming.forEach((ev) => {
      const d = parseYMD(ev.date);
      const item = document.createElement("div");
      item.className = "reminder-item";

      item.innerHTML = `
        <div class="reminder-date">${d.toLocaleDateString()}</div>
        <div>${ev.title || "(Untitled Event)"}</div>
        <div style="font-size:0.8rem;opacity:0.8;">
          ${formatTimeRange(ev.startTime, ev.endTime)}
        </div>
      `;

      container.appendChild(item);
    });
  });
}
