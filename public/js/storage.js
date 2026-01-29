const STORAGE_KEY = 'fosdem-my-events';
const FILTER_KEY = 'fosdem-my-events-filter';

export function getMyEvents() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getMyEventsFilterState() {
  return localStorage.getItem(FILTER_KEY) === 'true';
}

export function saveMyEventsFilterState(checked) {
  localStorage.setItem(FILTER_KEY, checked ? 'true' : 'false');
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
