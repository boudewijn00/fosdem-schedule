const STORAGE_KEY = 'fosdem-my-events';

export function getMyEvents() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveMyEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function isEventSaved(eventId) {
  return getMyEvents().includes(eventId);
}

export function toggleEvent(eventId) {
  const myEvents = getMyEvents();
  const index = myEvents.indexOf(eventId);
  if (index === -1) {
    myEvents.push(eventId);
  } else {
    myEvents.splice(index, 1);
  }
  saveMyEvents(myEvents);
  return index === -1;
}
