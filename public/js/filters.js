import { getMyEvents } from './storage.js';
import { findOverlapGroups, clearOverlapLayout, applyOverlapLayout, getOverlapWrappers } from './overlap.js';

// Filter events at data level (before rendering)
export function applyFiltersToEvents(events, selectedDate, selectedTrack, showOnlyMyEvents) {
  const myEvents = getMyEvents();

  return events.filter(event => {
    const eventDate = event.date.split('T')[0];
    const matchesDate = !selectedDate || eventDate === selectedDate;
    const matchesTrack = !selectedTrack || event.track === selectedTrack;
    const matchesMyEvents = !showOnlyMyEvents || myEvents.includes(event.id);
    return matchesDate && matchesTrack && matchesMyEvents;
  });
}

export function updateFilterOptions(dateFilter, trackFilter, eventCards) {
  const selectedDate = dateFilter.value;
  const selectedTrack = trackFilter.value;

  const availableDates = new Set();
  const availableTracks = new Set();

  eventCards.forEach(card => {
    const cardDate = card.getAttribute('data-date');
    const cardTrack = card.getAttribute('data-track');

    if (!selectedTrack || cardTrack === selectedTrack) {
      availableDates.add(cardDate);
    }

    if (!selectedDate || cardDate === selectedDate) {
      availableTracks.add(cardTrack);
    }
  });

  Array.from(dateFilter.options).forEach(option => {
    if (option.value === '') {
      option.hidden = !!selectedTrack;
      return;
    }
    option.hidden = !availableDates.has(option.value);
  });

  Array.from(trackFilter.options).forEach(option => {
    if (option.value === '') return;
    option.hidden = !availableTracks.has(option.value);
  });

  if (selectedDate && !availableDates.has(selectedDate)) {
    dateFilter.value = '';
  }
  if (selectedTrack && !availableTracks.has(selectedTrack)) {
    trackFilter.value = '';
  }
}

export function applyFilters(dateFilter, trackFilter, myEventsFilter, eventCards, eventCount) {
  const selectedDate = dateFilter.value;
  const selectedTrack = trackFilter.value;
  const showOnlyMyEvents = myEventsFilter.checked;
  const myEvents = getMyEvents();
  let visibleCount = 0;

  if (showOnlyMyEvents) {
    const groups = findOverlapGroups(myEvents, eventCards);
    clearOverlapLayout(eventCards);
    applyOverlapLayout(groups);
    const overlappingIds = new Set(groups.flat());

    eventCards.forEach(card => {
      const cardId = card.getAttribute('data-id');
      if (overlappingIds.has(cardId)) {
        card.classList.add('bg-red-50', 'border-red-300');
        card.classList.remove('bg-white', 'border-gray-200');
      } else {
        card.classList.remove('bg-red-50', 'border-red-300');
        card.classList.add('bg-white', 'border-gray-200');
      }
    });
  } else {
    clearOverlapLayout(eventCards);
    eventCards.forEach(card => {
      card.classList.remove('bg-red-50', 'border-red-300');
      card.classList.add('bg-white', 'border-gray-200');
    });
  }

  eventCards.forEach(card => {
    const cardDate = card.getAttribute('data-date');
    const cardTrack = card.getAttribute('data-track');
    const cardId = card.getAttribute('data-id');
    const matchesDate = !selectedDate || cardDate === selectedDate;
    const matchesTrack = !selectedTrack || cardTrack === selectedTrack;
    const matchesMyEvents = !showOnlyMyEvents || myEvents.includes(cardId);

    if (matchesDate && matchesTrack && matchesMyEvents) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const overlapWrappers = getOverlapWrappers();
  overlapWrappers.forEach(wrapper => {
    const hasVisible = Array.from(wrapper.children).some(c => c.style.display !== 'none');
    wrapper.style.display = hasVisible ? '' : 'none';
  });

  eventCount.textContent = `${visibleCount} events`;
  updateFilterOptions(dateFilter, trackFilter, eventCards);
}
