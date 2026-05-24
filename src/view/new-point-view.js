import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { EventType } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const EVENT_TYPES = Object.values(EventType);

const escapeHtml = (str) => {
  if (!str) {
    return '';
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export default class NewPointView extends AbstractStatefulView {
  #destinations;
  #offers;
  #onCancel;
  #onSave;
  #onDelete;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor(event, destinations, offers, onCancel, onSave, onDelete = null) {
    super();
    this.#destinations = Array.isArray(destinations) ? destinations : [];
    this.#offers = Array.isArray(offers) ? offers : [];
    this.#onCancel = onCancel;
    this.#onSave = onSave;
    this.#onDelete = onDelete;

    const initialState = NewPointView.parseEventToState(event);
    this._setState(initialState);
    this._restoreHandlers();
  }

  get template() {
    const { type, dateFrom, dateEnd, basePrice, destination, isEditMode } = this._state;

    const currentDestination = this.#destinations.find((d) => d.id === destination);
    const destinationName = currentDestination ? currentDestination.name : '';

    const offersList = Array.isArray(this.#offers) ? this.#offers : [];
    const currentOffers = offersList.find((o) => o.type === type)?.offers || [];
    const selectedOffers = Array.isArray(this._state.offers) ? this._state.offers : [];

    const destinationsList = Array.isArray(this.#destinations) ? this.#destinations : [];
    const destinationOptions = destinationsList.map((d) =>
      `<option value="${escapeHtml(d.name)}"></option>`
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
            <span class="event__offer-title">${escapeHtml(offer.title)}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `;
    }).join('');

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

    let destinationSectionHtml = '';
    if (currentDestination && (currentDestination.description || currentDestination.pictures?.length > 0)) {
      const picturesHtml = currentDestination.pictures?.map((pic) =>
        `<img class="event__photo" src="${pic.src}" alt="${escapeHtml(pic.description)}">`
      ).join('') || '';

      destinationSectionHtml = `
        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          ${currentDestination.description ? `<p class="event__destination-description">${escapeHtml(currentDestination.description)}</p>` : ''}
          ${currentDestination.pictures?.length > 0 ? `
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${picturesHtml}
              </div>
            </div>` : ''}
        </section>
      `;
    }

    const resetBtnText = isEditMode ? 'Delete' : 'Cancel';

    return `
      <li class="trip-events__item">
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
                value="${escapeHtml(destinationName)}"
                list="destination-list-1"
                required
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
                required
              >
            </div>
            <button class="event__save-btn btn btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">${resetBtnText}</button>
            ${isEditMode ? `
              <button class="event__rollup-btn" type="button">
                <span class="visually-hidden">Open event</span>
              </button>` : ''}
          </header>
          <section class="event__details">
            ${currentOffers.length > 0 ? `
              <section class="event__section event__section--offers">
                <h3 class="event__section-title event__section-title--offers">Offers</h3>
                <div class="event__available-offers">
                  ${offersHtml}
                </div>
              </section>` : ''}
            ${destinationSectionHtml}
          </section>
        </form>
      </li>
    `;
  }

  removeElement() {
    super.removeElement();
    this.#destroyDatepickers();
  }

  #destroyDatepickers() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  _restoreHandlers() {
    const form = this.element.querySelector('form');
    const resetBtn = this.element.querySelector('.event__reset-btn');
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    const typeGroup = this.element.querySelector('.event__type-group');
    const destinationInput = this.element.querySelector('.event__input--destination');
    const offersContainer = this.element.querySelector('.event__available-offers');
    const priceInput = this.element.querySelector('.event__input--price');

    if (form) {
      form.addEventListener('submit', this.#saveClickHandler);
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
    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#closeClickHandler);
    }

    if (resetBtn) {
      if (this._state.isEditMode) {
        resetBtn.addEventListener('click', this.#deleteClickHandler);
      } else {
        resetBtn.addEventListener('click', this.#resetClickHandler);
      }
    }

    this.#setDatepicker();
  }

  #saveClickHandler = (evt) => {
    evt.preventDefault();
    const input = this.element.querySelector('.event__input--destination');
    const currentDestination = this.#destinations.find((d) => d.name === input.value);

    if (!currentDestination) {
      input.setCustomValidity('Пожалуйста, выберите город из предложенного списка');
      input.reportValidity();
      return;
    }

    this.#onSave(NewPointView.parseStateToEvent(this._state));
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCancel();
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCancel();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#onDelete?.(NewPointView.parseStateToEvent(this._state));
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({ type: evt.target.value, offers: [] });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const currentDestination = this.#destinations.find((d) => d.name === evt.target.value);

    if (currentDestination) {
      evt.target.setCustomValidity('');
      this.updateElement({ destination: currentDestination.id });
    } else {
      evt.target.setCustomValidity('Выберите город из списка');
      evt.target.reportValidity();
      this.updateElement({ destination: '' });
    }
  };

  #offerChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    evt.preventDefault();
    const offerId = evt.target.dataset.offerId;
    const updatedOffers = [...(this._state.offers || [])];
    const idx = updatedOffers.indexOf(offerId);
    if (idx === -1) {
      updatedOffers.push(offerId);
    } else {
      updatedOffers.splice(idx, 1);
    }
    this._setState({ offers: updatedOffers });
  };

  #priceInputHandler = (evt) => {
    const val = evt.target.value.replace(/[^0-9]/g, '');
    this._setState({ basePrice: Number(val) || 0 });
    evt.target.value = val;
  };

  #dateFromChangeHandler = ([userDate]) => {
    const dateString = userDate ? userDate.toISOString() : '';
    this._setState({ dateFrom: dateString });

    if (this.#datepickerTo) {
      this.#datepickerTo.set('minDate', userDate || undefined);
    }
  };

  #dateEndChangeHandler = ([userDate]) => {
    const dateString = userDate ? userDate.toISOString() : '';
    this._setState({ dateEnd: dateString });

    if (this.#datepickerFrom) {
      this.#datepickerFrom.set('maxDate', userDate || undefined);
    }
  };

  #setDatepicker() {
    const dateFromInput = this.element.querySelector('#event-start-time-1');
    const dateEndInput = this.element.querySelector('#event-end-time-1');

    this.#destroyDatepickers();

    if (dateFromInput) {
      this.#datepickerFrom = flatpickr(dateFromInput, {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        defaultDate: this._state.dateFrom || undefined,
        onChange: this.#dateFromChangeHandler,
        ['time_24hr']: true,
        maxDate: this._state.dateEnd || undefined,
      });
    }

    if (dateEndInput) {
      this.#datepickerTo = flatpickr(dateEndInput, {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        defaultDate: this._state.dateEnd || undefined,
        onChange: this.#dateEndChangeHandler,
        ['time_24hr']: true,
        minDate: this._state.dateFrom || undefined,
      });
    }
  }

  static parseEventToState(event) {
    return {
      id: event?.id || '',
      type: event?.type || EventType.FLIGHT,
      destination: event?.destination || '',
      dateFrom: event?.dateFrom || '',
      dateEnd: event?.dateEnd || '',
      basePrice: event?.basePrice || 0,
      offers: Array.isArray(event?.offers) ? [...event.offers] : [],
      isFavorite: event?.isFavorite || false,
      isEditMode: event?.id && event.id !== '',
    };
  }

  static parseStateToEvent(state) {
    const event = {
      id: state.id,
      type: state.type,
      destination: state.destination,
      dateFrom: state.dateFrom,
      dateEnd: state.dateEnd,
      basePrice: state.basePrice,
      offers: state.offers,
      isFavorite: state.isFavorite,
    };

    delete event.isEditMode;
    return event;
  }
}
