import dayjs from 'dayjs';
import he from 'he';

const DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm';

function formatDuration(dateFrom, dateEnd) {
  const start = new Date(dateFrom);
  const end = new Date(dateEnd);
  const diffMs = end - start;

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  const pad = (num) => String(num).padStart(2, '0');

  if (days > 0) {
    return `${pad(days)}D ${pad(hours)}H ${pad(minutes)}M`;
  }
  if (hours > 0) {
    return `${pad(hours)}H ${pad(minutes)}M`;
  }
  return `${minutes}M`;
}

export default class EventView {
  constructor(event, destination, offers) {
    this.event = event;
    this.destination = destination;
    this.offers = offers;
    this.element = null;
  }

  get template() {
    const { type, dateFrom, dateEnd, basePrice, isFavorite } = this.event;
    const destinationName = this.destination ? this.destination.name : '';

    const offersHtml = this.offers.map((offer) => `
      <li class="event__offer">
        <span class="event__offer-title">${he.encode(offer.title)}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </li>
    `).join('');

    return `
      <div class="event">
        <time class="event__date" datetime="${dayjs(dateFrom).format('YYYY-MM-DD')}">${dayjs(dateFrom).format(DATE_FORMAT)}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${he.encode(type)} ${he.encode(destinationName)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dayjs(dateFrom).format(DATETIME_FORMAT)}">${dayjs(dateFrom).format(TIME_FORMAT)}</time>
            &mdash;
            <time class="event__end-time" datetime="${dayjs(dateEnd).format(DATETIME_FORMAT)}">${dayjs(dateEnd).format(TIME_FORMAT)}</time>
          </p>
          <p class="event__duration">${formatDuration(dateFrom, dateEnd)}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${offersHtml}
        </ul>
        <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    `;
  }

  getElement() {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.innerHTML = this.template;
      this.element = this.element.firstElementChild;
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
