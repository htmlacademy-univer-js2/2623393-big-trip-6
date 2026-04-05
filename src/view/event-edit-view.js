import he from 'he';
import { EventType } from '../const.js';

const EVENT_TYPES = Object.values(EventType);

export default class EventEditView {
  constructor(event = null, destinations = [], offers = []) {
    this.event = event;
    this.destinations = destinations;
    this.offers = offers;
    this.element = null;

    this._eventData = event || {
      type: EventType.FLIGHT,
      destination: '',
      dateFrom: '',
      dateEnd: '',
      basePrice: 0,
      offers: [],
      isFavorite: false,
    };
  }

  get template() {
    const { type, destination, dateFrom, dateEnd, basePrice } = this._eventData;
    const destinationData = this.destinations.find((d) => d.id === destination);
    const currentOffers = this.offers.find((o) => o.type === type)?.offers || [];
    const selectedOffers = this._eventData.offers || [];

    const destinationOptions = this.destinations.map((d) =>
      `<option value="${he.encode(d.name)}"></option>`
    ).join('');

    const offersHtml = currentOffers.map((offer) => {
      const isChecked = selectedOffers.includes(offer.id) ? 'checked' : '';
      return `
        <div class="event__offer-selector">
          <input
            class="event__offer-checkbox visually-hidden"
            id="event-offer-${offer.id}"
            type="checkbox"
            name="event-offer-${offer.id}"
            ${isChecked}
            data-offer-id="${offer.id}"
          >
          <label class="event__offer-label" for="event-offer-${offer.id}">
            <span class="event__offer-title">${he.encode(offer.title)}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `;
    }).join('');

    const isDestinationExists = destinationData && (
      destinationData.description ||
      (destinationData.pictures && destinationData.pictures.length > 0)
    );

    const destinationHtml = isDestinationExists
      ? `
        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${he.encode(destinationData.description)}</p>
          ${destinationData.pictures && destinationData.pictures.length > 0
    ? `
              <div class="event__photos-container">
                <div class="event__photos-tape">
                  ${destinationData.pictures.map((pic) =>
    `<img class="event__photo" src="${he.encode(pic.src)}" alt="${he.encode(pic.description)}">`
  ).join('')}
                </div>
              </div>`
    : ''}
        </section>`
      : '';

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${EVENT_TYPES.map((eventType) => {
    const isChecked = type === eventType ? 'checked' : '';
    return `
                    <div class="event__type-item">
                      <input
                        id="event-type-${eventType}-1"
                        class="event__type-input visually-hidden"
                        type="radio"
                        name="event-type"
                        value="${eventType}"
                        ${isChecked}
                      >
                      <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">
                        ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                      </label>
                    </div>
                  `;
  }).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${type}</label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${destinationData ? he.encode(destinationData.name) : ''}"
              list="destination-list-1"
            >
            <datalist id="destination-list-1">
              ${destinationOptions}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${dateFrom}"
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${dateEnd}"
            >
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>&euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${basePrice}"
            >
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${this.event ? 'Delete' : 'Cancel'}</button>
          ${this.event
    ? '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Open event</span></button>'
    : ''}
        </header>
        <section class="event__details">
          ${currentOffers.length > 0
    ? `
              <section class="event__section event__section--offers">
                <h3 class="event__section-title event__section-title--offers">Offers</h3>
                <div class="event__available-offers">
                  ${offersHtml}
                </div>
              </section>`
    : ''}
          ${destinationHtml}
        </section>
      </form>
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
