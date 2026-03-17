// manage-mini.js
import { getAllEvents } from "./db.js";
import { ymd, addDays, startOfWeek, sameDay } from "./utils.js";

export function initManageMiniCalendar({
  daysContainer,
  prevButton,
  nextButton,
  labelElement
}) {
  if (!daysContainer) return;

  let weekStart = startOfWeek(new Date());

  function renderMini() {
    daysContainer.innerHTML = "";

    const weekEnd = addDays(weekStart, 6);
    labelElement.textContent =
      `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ` +
      `${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

    getAllEvents().then((events) => {
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        const ds = ymd(d);
        const evs = events.filter((ev) => ev.date === ds);

        const div = document.createElement("div");
        div.className = "mini-day";

        if (sameDay(d, new Date())) div.classList.add("today");
        if (evs.length) div.classList.add("has-events");

        div.innerHTML = `
          <div class="mini-date">${d.getDate()}</div>
          <div class="mini-count">${evs.length ? evs.length + " evt" : ""}</div>
        `;

        div.addEventListener("click", () => {
          const url = new URL(window.location.origin + "/calendar.html");
          url.searchParams.set("date", ds);
          window.location.href = url.toString();
        });

        daysContainer.appendChild(div);
      }
    });
  }

  prevButton?.addEventListener("click", () => {
    weekStart = addDays(weekStart, -7);
    renderMini();
  });

  nextButton?.addEventListener("click", () => {
    weekStart = addDays(weekStart, 7);
    renderMini();
  });

  renderMini();
}
