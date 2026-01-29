import { getMyEvents, toggleEvent } from './storage.js';
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
    applyFilters(dateFilter, trackFilter, myEventsFilter, eventCards, eventCount);
  }

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

  // Filter listeners
  dateFilter.addEventListener('change', handleFilters);
  trackFilter.addEventListener('change', handleFilters);
  myEventsFilter.addEventListener('change', handleFilters);

  // Bio toggle
  document.querySelectorAll('.bio-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const bio = button.nextElementSibling;
      bio.classList.toggle('hidden');
    });
  });
});
