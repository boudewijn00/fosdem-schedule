import { getMyEvents, toggleEvent, getMyEventsFilterState, saveMyEventsFilterState } from './storage.js';
import { updateSingleButtonState } from './buttons.js';
import { applyFiltersToEvents } from './filters.js';
import { initVirtualList, setFilteredEvents, getRenderedCards, getAllEvents } from './virtual-list.js';

document.addEventListener('DOMContentLoaded', () => {
  const dateFilter = document.getElementById('date-filter');
  const trackFilter = document.getElementById('track-filter');
  const myEventsFilter = document.getElementById('my-events-filter');
  const eventCount = document.getElementById('event-count');
  const myEventsCount = document.getElementById('my-events-count');
  const eventsContainer = document.getElementById('events-container');
  const eventsDataEl = document.getElementById('events-data');

  if (!eventsDataEl || !eventsContainer) return;

  const allEvents = JSON.parse(eventsDataEl.textContent);

  function updateMyEventsCount() {
    myEventsCount.textContent = getMyEvents().length;
  }

  function handleFilters() {
    saveMyEventsFilterState(myEventsFilter.checked);
    const filtered = applyFiltersToEvents(
      allEvents,
      dateFilter.value,
      trackFilter.value,
      myEventsFilter.checked
    );
    setFilteredEvents(filtered);
    eventCount.textContent = `${filtered.length} events`;
    updateFilterOptions();
  }

  function updateFilterOptions() {
    const selectedDate = dateFilter.value;
    const selectedTrack = trackFilter.value;

    const availableDates = new Set();
    const availableTracks = new Set();

    allEvents.forEach(event => {
      const eventDate = event.date.split('T')[0];
      const eventTrack = event.track;

      if (!selectedTrack || eventTrack === selectedTrack) {
        availableDates.add(eventDate);
      }
      if (!selectedDate || eventDate === selectedDate) {
        availableTracks.add(eventTrack);
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
  }

  function attachCardListeners() {
    const cards = getRenderedCards();
    cards.forEach(card => {
      const saveBtn = card.querySelector('.save-btn');
      if (saveBtn && !saveBtn.hasAttribute('data-listener')) {
        saveBtn.setAttribute('data-listener', 'true');
        const eventId = saveBtn.getAttribute('data-id');
        updateSingleButtonState(saveBtn);

        saveBtn.addEventListener('click', () => {
          toggleEvent(eventId);
          updateMyEventsCount();
          updateSingleButtonState(saveBtn);
          if (myEventsFilter.checked) {
            handleFilters();
          }
        });
      }

      // Bio toggle
      card.querySelectorAll('.bio-toggle').forEach(button => {
        if (!button.hasAttribute('data-listener')) {
          button.setAttribute('data-listener', 'true');
          button.addEventListener('click', () => {
            const bio = button.nextElementSibling;
            const chevron = button.querySelector('.bio-chevron');
            bio.classList.toggle('hidden');
            chevron.classList.toggle('rotate-180');
          });
        }
      });

      // Abstract toggle
      card.querySelectorAll('.abstract-toggle').forEach(button => {
        if (!button.hasAttribute('data-listener')) {
          button.setAttribute('data-listener', 'true');
          button.addEventListener('click', () => {
            const text = button.previousElementSibling;
            const isExpanded = text.classList.toggle('expanded');
            text.classList.toggle('line-clamp-2');
            button.textContent = isExpanded ? 'Read less' : 'Read more';
          });
        }
      });
    });
  }

  // Restore filter state from localStorage
  myEventsFilter.checked = getMyEventsFilterState();

  // Initialize virtual list
  const initialFiltered = applyFiltersToEvents(
    allEvents,
    dateFilter.value,
    trackFilter.value,
    myEventsFilter.checked
  );
  initVirtualList(initialFiltered, eventsContainer);
  eventCount.textContent = `${initialFiltered.length} events`;

  // Listen for batch render events to attach listeners
  eventsContainer.addEventListener('batchRendered', attachCardListeners);
  attachCardListeners();

  // Initialize states
  updateMyEventsCount();

  // Filter listeners
  dateFilter.addEventListener('change', handleFilters);
  trackFilter.addEventListener('change', handleFilters);
  myEventsFilter.addEventListener('change', handleFilters);
});
