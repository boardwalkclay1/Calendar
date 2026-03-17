// init-calendar.js
import { setView, setDate } from "./state.js";
import { parseYMD } from "./utils.js";
import { renderMonth } from "./render-month.js";
import { renderWeek } from "./render-week.js";
import { renderAgenda } from "./render-agenda.js";
import { initModal } from "./modal.js";

export function initFullCalendar({
  grid,
  weekdayLabels,
  label,
  btnToday,
  btnPrev,
  btnNext,
  btnMonth,
  btnWeek,
  btnNew,
  agenda,
  modalElements
}) {
  let currentViewLocal = "month";

  const params = new URLSearchParams(window.location.search);
  if (params.has("date")) {
    setDate(parseYMD(params.get("date")));
  }

  function renderCalendar() {
    if (currentViewLocal === "month") {
      renderMonth(grid, label);
    } else {
      renderWeek(grid, label, weekdayLabels);
    }
    renderAgenda(agenda, renderCalendar);
  }

  initModal({
    ...modalElements,
    onRerender: renderCalendar
  });

  btnToday?.addEventListener("click", () => {
    setDate(new Date());
    renderCalendar();
  });

  btnPrev?.addEventListener("click", () => {
    const d = new Date();
    if (currentViewLocal === "month") {
      d.setFullYear(label.dataset.year || new Date().getFullYear());
      d.setMonth((label.dataset.month || new Date().getMonth()) - 1, 1);
    }
    // simpler: just use current date and adjust
    if (currentViewLocal === "month") {
      const now = new Date();
      now.setMonth(now.getMonth() - 1, 1);
      setDate(now);
    } else {
      const now = new Date();
      now.setDate(now.getDate() - 7);
      setDate(now);
    }
    renderCalendar();
  });

  btnNext?.addEventListener("click", () => {
    if (currentViewLocal === "month") {
      const now = new Date();
      now.setMonth(now.getMonth() + 1, 1);
      setDate(now);
    } else {
      const now = new Date();
      now.setDate(now.getDate() + 7);
      setDate(now);
    }
    renderCalendar();
  });

  btnMonth?.addEventListener("click", () => {
    currentViewLocal = "month";
    setView("month");
    renderCalendar();
  });

  btnWeek?.addEventListener("click", () => {
    currentViewLocal = "week";
    setView("week");
    renderCalendar();
  });

  btnNew?.addEventListener("click", () => {
    // open empty event for current date
    const ev = { date: null };
    import("./modal.js").then(({ openEventModal }) => {
      openEventModal(ev, new Date());
    });
  });

  renderCalendar();
}
