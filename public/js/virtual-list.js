const BATCH_SIZE = 30;

let allEvents = [];
let filteredEvents = [];
let renderedCount = 0;
let container = null;
let observer = null;
let sentinel = null;

export function initVirtualList(events, containerEl) {
  allEvents = events;
  filteredEvents = events;
  container = containerEl;
  renderedCount = 0;

  // Create sentinel element for IntersectionObserver
  sentinel = document.createElement('div');
  sentinel.id = 'virtual-list-sentinel';
  sentinel.style.height = '1px';

  // Set up IntersectionObserver
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        renderNextBatch();
      }
    },
    { rootMargin: '200px' }
  );

  renderNextBatch();
}

export function setFilteredEvents(events) {
  filteredEvents = events;
  renderedCount = 0;
  container.innerHTML = '';
  renderNextBatch();
}

export function getRenderedCards() {
  return container.querySelectorAll('.event-card');
}

export function getAllEvents() {
  return allEvents;
}

function renderNextBatch() {
  if (renderedCount >= filteredEvents.length) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const endIndex = Math.min(renderedCount + BATCH_SIZE, filteredEvents.length);

  for (let i = renderedCount; i < endIndex; i++) {
    const card = createEventCard(filteredEvents[i]);
    fragment.appendChild(card);
  }

  // Remove sentinel before appending new content
  if (sentinel.parentNode) {
    sentinel.remove();
    observer.unobserve(sentinel);
  }

  container.appendChild(fragment);
  renderedCount = endIndex;

  // Re-add sentinel if there are more events to load
  if (renderedCount < filteredEvents.length) {
    container.appendChild(sentinel);
    observer.observe(sentinel);
  }

  // Dispatch event so other modules can attach listeners
  container.dispatchEvent(new CustomEvent('batchRendered'));
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createEventCard(event) {
  const article = document.createElement('article');
  article.className = 'event-card bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow';
  article.dataset.track = event.track;
  article.dataset.date = event.date.split('T')[0];
  article.dataset.start = event.start;
  article.dataset.end = event.end;
  article.dataset.id = event.id;

  const personsHtml = event.persons.length > 0 ? `
    <div class="mt-3">
      <h4>${event.persons.length === 1 ? 'Speaker' : 'Speakers'}</h4>
      <div class="mt-1 space-y-2">
        ${event.persons.map(person => person.bio ? `
          <div class="text-sm">
            <button type="button" class="bio-toggle inline-flex items-center gap-1 max-w-full font-medium text-gray-800 hover:text-fosdem-purple transition-colors">
              <svg class="bio-chevron w-4 h-4 shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              <span class="truncate">${escapeHtml(person.name)}</span>
            </button>
            <p class="bio-content text-gray-500 mt-1 hidden">${escapeHtml(person.bio)}</p>
          </div>
        ` : `
          <div class="text-sm">
            <span class="font-medium text-gray-800 truncate block">${escapeHtml(person.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const abstractHtml = event.abstract ? `
    <div class="abstract-container mt-3">
      <p class="abstract-text text-sm text-gray-500 line-clamp-2">${escapeHtml(event.abstract)}</p>
      <button type="button" class="abstract-toggle px-3 py-1.5 text-sm md:px-2 md:py-1 md:text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors mt-2">
        Read more
      </button>
    </div>
  ` : '';

  article.innerHTML = `
    <div class="event-card-inner flex flex-col gap-3">
      <div class="event-card-meta flex flex-wrap items-center gap-2 md:gap-3">
        <button
          class="save-btn px-3 py-2 text-sm md:px-3 md:py-1.5 md:text-xs font-medium rounded-lg border transition-colors"
          data-id="${escapeHtml(event.id)}"
        >
          Add to my events
        </button>
        <div class="event-time text-sm font-medium text-gray-900">${escapeHtml(event.start)} - ${escapeHtml(event.end)}</div>
        <div class="event-duration text-xs text-gray-500">(${escapeHtml(event.duration)})</div>
        <div class="event-date text-xs text-gray-400">${escapeHtml(event.date.split('T')[0])}</div>
      </div>

      <div class="event-card-content">
        <h3 class="text-lg font-semibold text-gray-900">
          <a href="${escapeHtml(event.url)}" target="_blank" class="hover:text-fosdem-purple">
            ${escapeHtml(event.title)}
          </a>
        </h3>

        <div class="flex flex-wrap gap-2 mt-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            ${escapeHtml(event.track)}
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ${escapeHtml(event.room)}
          </span>
        </div>

        ${abstractHtml}
        ${personsHtml}
      </div>
    </div>
  `;

  return article;
}
