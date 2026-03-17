// utils.js
export const ymd = (d) => d.toISOString().slice(0, 10);

export const parseYMD = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const startOfWeek = (d) => {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
};

export const formatTimeRange = (s, e) => {
  if (!s && !e) return "";
  if (s && e) return `${s} – ${e}`;
  return s || e;
};
