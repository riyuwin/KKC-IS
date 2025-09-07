export function dateFormat(v) {
  if (!v) return "";
  if (typeof v === "string") {
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) {
      const [y, mo, d] = m[1].split("-").map(Number);
      const dt = new Date(y, mo - 1, d);
      return dt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  const dt = new Date(v);
  if (Number.isNaN(dt.getTime())) return String(v);
  return dt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const formatDateDMY = (dateStr) => {
  if (!dateStr) return "";

  // Parse ISO string properly
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return String(dateStr);

  const d = String(dt.getDate()).padStart(2, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const y = dt.getFullYear();

  return `${d}/${m}/${y}`; // dd/mm/yyyy
};
