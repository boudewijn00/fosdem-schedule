import { getMyEvents, toggleEvent, getMyEventsFilterState, saveMyEventsFilterState } from './storage.js';
import { updateAllButtonStates } from './buttons.js';
import { applyFilters } from './filters.js';

document.addEventListener('DOMContentLoaded', () => {
  const dateFilter = document.getElementById('date-filter');
  const trackFilter = document.getElementById('track-filter');
  const myEventsFilter = document.getElementById('my-events-filter');
  const eventCount = document.getElementById('event-count');
  const myEventsCount = document.getElementById('my-events-count');
  const eventCards = document.querySelectorAll('.event-card');
  const saveButtons = document.querySelectorAll('.save-btn');

  function updateMyEventsCount() {
    myEventsCount.textContent = getMyEvents().length;
  }

  function handleFilters() {
    saveMyEventsFilterState(myEventsFilter.checked);
    applyFilters(dateFilter, trackFilter, myEventsFilter, eventCards, eventCount);
  }

  // Restore filter state from localStorage
  myEventsFilter.checked = getMyEventsFilterState();

  // Initialize button click handlers
  saveButtons.forEach(button => {
    const eventId = button.getAttribute('data-id');

    button.addEventListener('click', () => {
      toggleEvent(eventId);
      updateMyEventsCount();
      updateAllButtonStates(saveButtons);
      handleFilters();
    });
  });

  // Initialize states
  updateAllButtonStates(saveButtons);
  updateMyEventsCount();

  // Apply filters on load (handles restored "my events only" state)
  if (myEventsFilter.checked) {
    handleFilters();
  }

  // Filter listeners
  dateFilter.addEventListener('change', handleFilters);
  trackFilter.addEventListener('change', handleFilters);
  myEventsFilter.addEventListener('change', handleFilters);

  // Bio toggle (clicking speaker name)
  document.querySelectorAll('.bio-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const bio = button.nextElementSibling;
      const chevron = button.querySelector('.bio-chevron');
      bio.classList.toggle('hidden');
      chevron.classList.toggle('rotate-180');
    });
  });

  // Abstract toggle
  document.querySelectorAll('.abstract-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const text = button.previousElementSibling;
      const isExpanded = text.classList.toggle('expanded');
      text.classList.toggle('line-clamp-2');
      button.textContent = isExpanded ? 'Read less' : 'Read more';
    });
  });
});
