import { isEventSaved } from './storage.js';
import { hasOverlapWithSavedEvents } from './overlap.js';

export function updateButtonState(button, isSaved, hasOverlap) {
  button.classList.remove('border-gray-300', 'text-gray-700', 'hover:bg-gray-50',
    'border-fosdem-purple', 'bg-fosdem-purple', 'text-white', 'hover:bg-purple-700',
    'border-red-500', 'bg-red-50', 'text-red-700', 'hover:bg-red-100');

  if (isSaved) {
    button.textContent = 'Remove from my events';
    button.classList.add('border-fosdem-purple', 'bg-fosdem-purple', 'text-white', 'hover:bg-purple-700');
  } else if (hasOverlap) {
    button.textContent = 'Add to my events';
    button.classList.add('border-red-500', 'bg-red-50', 'text-red-700', 'hover:bg-red-100');
  } else {
    button.textContent = 'Add to my events';
    button.classList.add('border-gray-300', 'text-gray-700', 'hover:bg-gray-50');
  }
}

export function updateAllButtonStates(saveButtons) {
  saveButtons.forEach(button => {
    const eventId = button.getAttribute('data-id');
    const card = button.closest('.event-card');
    const date = card.getAttribute('data-date');
    const start = card.getAttribute('data-start');
    const end = card.getAttribute('data-end');
    const isSaved = isEventSaved(eventId);
    const hasOverlap = !isSaved && hasOverlapWithSavedEvents(eventId, date, start, end);
    updateButtonState(button, isSaved, hasOverlap);
  });
}
