import { getMyEvents } from './storage.js';
import { timeToMinutes, eventsOverlap } from './time-utils.js';

export function hasOverlapWithSavedEvents(eventId, date, start, end) {
  const myEvents = getMyEvents();
  for (const savedId of myEvents) {
    if (savedId === eventId) continue;
    const savedCard = document.querySelector(`.event-card[data-id="${savedId}"]`);
    if (!savedCard) continue;
    const savedDate = savedCard.getAttribute('data-date');
    const savedStart = savedCard.getAttribute('data-start');
    const savedEnd = savedCard.getAttribute('data-end');
    if (eventsOverlap(date, start, end, savedDate, savedStart, savedEnd)) {
      return true;
    }
  }
  return false;
}

export function findOverlapGroups(myEvents, eventCards) {
  const savedCards = Array.from(eventCards).filter(card =>
    myEvents.includes(card.getAttribute('data-id'))
  );

  const overlaps = new Map();
  savedCards.forEach(card => overlaps.set(card.getAttribute('data-id'), new Set()));

  for (let i = 0; i < savedCards.length; i++) {
    for (let j = i + 1; j < savedCards.length; j++) {
      const card1 = savedCards[i];
      const card2 = savedCards[j];
      const id1 = card1.getAttribute('data-id');
      const id2 = card2.getAttribute('data-id');

      if (eventsOverlap(
        card1.getAttribute('data-date'), card1.getAttribute('data-start'), card1.getAttribute('data-end'),
        card2.getAttribute('data-date'), card2.getAttribute('data-start'), card2.getAttribute('data-end')
      )) {
        overlaps.get(id1).add(id2);
        overlaps.get(id2).add(id1);
      }
    }
  }

  const visited = new Set();
  const groups = [];

  savedCards.forEach(card => {
    const id = card.getAttribute('data-id');
    if (visited.has(id)) return;

    const group = [];
    const stack = [id];
    while (stack.length > 0) {
      const current = stack.pop();
      if (visited.has(current)) continue;
      visited.add(current);
      group.push(current);
      overlaps.get(current).forEach(neighbor => {
        if (!visited.has(neighbor)) stack.push(neighbor);
      });
    }

    if (group.length > 1) {
      groups.push(group);
    }
  });

  return groups;
}

const overlapWrappers = [];

export function clearOverlapLayout(eventCards) {
  overlapWrappers.forEach(wrapper => {
    const cards = Array.from(wrapper.children);
    cards.forEach(card => {
      wrapper.parentNode.insertBefore(card, wrapper);
    });
    wrapper.remove();
  });
  overlapWrappers.length = 0;
  eventCards.forEach(card => card.classList.remove('flex-1', 'min-w-0'));
}

export function applyOverlapLayout(groups) {
  groups.forEach(group => {
    const cards = group.map(id => document.querySelector(`.event-card[data-id="${id}"]`)).filter(Boolean);
    if (cards.length < 2) return;

    cards.sort((a, b) => {
      const startA = timeToMinutes(a.getAttribute('data-start'));
      const startB = timeToMinutes(b.getAttribute('data-start'));
      return startA - startB;
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'flex gap-4 overlap-group';

    const firstCard = cards[0];
    firstCard.parentNode.insertBefore(wrapper, firstCard);

    cards.forEach(card => {
      card.classList.add('flex-1', 'min-w-0');
      wrapper.appendChild(card);
    });

    overlapWrappers.push(wrapper);
  });
}

export function getOverlapWrappers() {
  return overlapWrappers;
}
