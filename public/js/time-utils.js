export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function eventsOverlap(date1, start1, end1, date2, start2, end2) {
  if (date1 !== date2) return false;
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}
