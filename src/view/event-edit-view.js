import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import he from 'he';
import { EventType } from '../const.js';

const EVENT_TYPES = Object.values(EventType);

export default class EventEditView extends AbstractStatefulView {
  #destinations;
  #offers;
  #onFormSubmit;
  #onCloseClick;
  #onDeleteClick;

  constructor(event, destinations, offers, onFormSubmit, onCloseClick, onDeleteClick) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onFormSubmit = onFormSubmit;
    this.#onCloseClick = onCloseClick;
    this.#onDeleteClick = onDeleteClick;

    this._setState(EventEditView.parseEventToState(event));
    this._restoreHandlers();
  }

  get template() {
    const { type, destination, dateFrom, dateEnd, basePrice } = this._state;
    const destinationData = this.#destinations.find((d) => d.id === destination);
    const currentOffers = this.#offers.find((o) => o.type === type)?.offers || [];
    const selectedOffers = this._state.offers || [];

    const destinationOptions = this.#destinations.map((d) =>
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

    // Выносим генерацию радиокнопок типов точек маршрута
    const eventTypesHtml = EVENT_TYPES.map((eventType) => {
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
    }).join('');

    // Выносим блок с фотографиями отдельно
    let picturesHtml = '';
    if (destinationData && destinationData.pictures && destinationData.pictures.length > 0) {
      const picturesList = destinationData.pictures.map((pic) =>
        `<img class="event__photo" src="${he.encode(pic.src)}" alt="${he.encode(pic.description)}">`
      ).join('');

      picturesHtml = `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${picturesList}
          </div>
        </div>
      `;
    }

    // Выносим блок пункта назначения
    const destinationHtml = destinationData && (destinationData.description || picturesHtml)
      ? `
        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${he.encode(destinationData.description)}</p>
          ${picturesHtml}
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
                ${eventTypesHtml}
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
          <button class="event__reset-btn" type="reset">${this._state.id ? 'Delete' : 'Cancel'}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${currentOffers.length > 0
    ? `
              <section class="event__section event__section--offers">
                <h3 class="event__section-title event__section-title--offers">Offers</h3>
                <div class="event__available-offers">
                  ${offersHtml}
                </div>
              </section>` : ''}
          ${destinationHtml}
        </section>
      </form>
    `;
  }

  _restoreHandlers() {
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    const resetBtn = this.element.querySelector('.event__reset-btn');
    const form = this.element.querySelector('form');
    const typeGroup = this.element.querySelector('.event__type-group');
    const destinationInput = this.element.querySelector('.event__input--destination');
    const offersContainer = this.element.querySelector('.event__available-offers');
    const priceInput = this.element.querySelector('.event__input--price');

    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#closeClickHandler);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', this.#resetClickHandler);
    }
    if (form) {
      form.addEventListener('submit', this.#formSubmitHandler);
    }
    if (typeGroup) {
      typeGroup.addEventListener('change', this.#typeChangeHandler);
    }
    if (destinationInput) {
      destinationInput.addEventListener('change', this.#destinationChangeHandler);
    }
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#offerChangeHandler);
    }
    if (priceInput) {
      priceInput.addEventListener('input', this.#priceInputHandler);
    }
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit(EventEditView.parseStateToEvent(this._state));
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCloseClick();
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    this.#onDeleteClick(EventEditView.parseStateToEvent(this._state));
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const currentDestination = this.#destinations.find((d) => d.name === evt.target.value);

    this.updateElement({
      destination: currentDestination ? currentDestination.id : '',
    });
  };

  #offerChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    evt.preventDefault();

    const offerId = evt.target.dataset.offerId;
    const currentOffers = [...this._state.offers];
    const index = currentOffers.indexOf(offerId);

    if (index === -1) {
      currentOffers.push(offerId);
    } else {
      currentOffers.splice(index, 1);
    }

    this._setState({
      offers: currentOffers,
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: Number(evt.target.value) || 0,
    });
  };

  static parseEventToState(event) {
    return event ? { ...event } : {
      type: EventType.FLIGHT,
      destination: '',
      dateFrom: '',
      dateEnd: '',
      basePrice: 0,
      offers: [],
      isFavorite: false,
    };
  }

  static parseStateToEvent(state) {
    return { ...state };
  }
}
