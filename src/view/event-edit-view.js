import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import he from 'he';
import { EventType } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { SHAKE_ANIMATION_TIMEOUT } from '../framework/view/abstract-view.js';

const EVENT_TYPES = Object.values(EventType);

export default class EventEditView extends AbstractStatefulView {
  #destinations;
  #offers;
  #onFormSubmit;
  #onCloseClick;
  #onDeleteClick;
  #datepickerFrom = null;
  #datepickerTo = null;

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
    const { id, type, destination, dateFrom, dateEnd, basePrice, isDisabled, isSaving, isDeleting } = this._state;
    const destinationData = this.#destinations.find((d) => d.id === destination);
    const currentOffers = this.#offers.find((o) => o.type === type)?.offers || [];
    const selectedOffers = this._state.offers || [];

    const resetBtnText = id ? 'Delete' : 'Cancel';
    const computedResetBtnText = isDeleting ? 'Deleting...' : resetBtnText;

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post" autocomplete="off">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>
              <div class="event__type-list">
                <fieldset class="event__type-group" ${isDisabled ? 'disabled' : ''}>
                  <legend class="visually-hidden">Event type</legend>
                  ${this.#getEventTypesHtml(type, isDisabled)}
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
                required
                ${isDisabled ? 'disabled' : ''}
              >
              <datalist id="destination-list-1">
                ${this.#getDestinationOptionsHtml()}
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
                ${isDisabled ? 'disabled' : ''}
              >
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input
                class="event__input event__input--time"
                id="event-end-time-1"
                type="text"
                name="event-end-time"
                value="${dateEnd}"
                ${isDisabled ? 'disabled' : ''}
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
                ${isDisabled ? 'disabled' : ''}
              >
            </div>
            <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
              ${isSaving ? 'Saving...' : 'Save'}
            </button>
            <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>
              ${computedResetBtnText}
            </button>
            <button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
              <span class="visually-hidden">Open event</span>
            </button>
          </header>
          <section class="event__details">
            ${currentOffers.length > 0 ? this.#getOffersSectionHtml(currentOffers, selectedOffers, isDisabled) : ''}
            ${this.#getDestinationHtml(destinationData)}
          </section>
        </form>
      </li>
    `;
  }

  setViewState(state) {
    if (state.isAborting) {
      const saveBtn = this.element.querySelector('.event__save-btn');
      const resetBtn = this.element.querySelector('.event__reset-btn');

      if (saveBtn) {
        saveBtn.textContent = 'Save';
      }

      if (resetBtn) {
        resetBtn.textContent = this._state.id ? 'Delete' : 'Cancel';
      }

      this.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
      return;
    }

    this.updateElement({
      isDisabled: true,
      isSaving: state.isSaving || false,
      isDeleting: state.isDeleting || false,
    });
  }

  shake(callback) {
    const formElement = this.element.querySelector('.event--edit');

    if (!formElement) {
      super.shake(callback);
      return;
    }

    if (!document.getElementById('js-shake-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'js-shake-styles';
      styleElement.textContent = `
        @keyframes customJsShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .js-shake-forced {
          animation: customJsShake 0.6s ease-in-out !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    formElement.classList.add('js-shake-forced');

    setTimeout(() => {
      formElement.classList.remove('js-shake-forced');
      callback?.();
    }, SHAKE_ANIMATION_TIMEOUT);
  }

  removeElement() {
    super.removeElement();

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

    this.#setDatepicker();
  }

  #getEventTypesHtml(currentType, isDisabled) {
    return EVENT_TYPES.map((eventType) => {
      const isChecked = currentType === eventType ? 'checked' : '';
      return `
        <div class="event__type-item">
          <input
            id="event-type-${eventType}-1"
            class="event__type-input visually-hidden"
            type="radio"
            name="event-type"
            value="${eventType}"
            ${isChecked}
            ${isDisabled ? 'disabled' : ''}
          >
          <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">
            ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}
          </label>
        </div>
      `;
    }).join('');
  }

  #getDestinationOptionsHtml() {
    return this.#destinations.map((d) =>
      `<option value="${he.encode(d.name)}"></option>`
    ).join('');
  }

  #getOffersSectionHtml(offers, selectedOffers, isDisabled) {
    const offersHtml = offers.map((offer) => {
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
            ${isDisabled ? 'disabled' : ''}
          >
          <label class="event__offer-label" for="event-offer-${offer.id}">
            <span class="event__offer-title">${he.encode(offer.title)}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `;
    }).join('');

    return `
      <section class="event__section event__section--offers">
        <h3 class="event__section-title event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offersHtml}
        </div>
      </section>
    `;
  }

  #getDestinationHtml(destinationData) {
    if (!destinationData) {
      return '';
    }

    let picturesHtml = '';
    if (destinationData.pictures && destinationData.pictures.length > 0) {
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

    if (!destinationData.description && !picturesHtml) {
      return '';
    }

    return `
      <section class="event__section event__section--destination">
        <h3 class="event__section-title event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${he.encode(destinationData.description || '')}</p>
        ${picturesHtml}
      </section>
    `;
  }

  #setDatepicker() {
    if (this._state.isDisabled) {
      return;
    }

    const dateFromInput = this.element.querySelector('#event-start-time-1');
    const dateEndInput = this.element.querySelector('#event-end-time-1');

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
    }

    this.#datepickerFrom = flatpickr(
      dateFromInput,
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
        ['time_24hr']: true,
        maxDate: this._state.dateEnd || undefined,
      },
    );

    this.#datepickerTo = flatpickr(
      dateEndInput,
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        defaultDate: this._state.dateEnd,
        onChange: this.#dateEndChangeHandler,
        ['time_24hr']: true,
        minDate: this._state.dateFrom || undefined,
      },
    );
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate ? userDate.toISOString() : '',
    });
  };

  #dateEndChangeHandler = ([userDate]) => {
    this._setState({
      dateEnd: userDate ? userDate.toISOString() : '',
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    if (!this._state.destination) {
      this.shake();
      return;
    }

    if (this._state.basePrice <= 0) {
      this.shake();
      return;
    }

    if (!this._state.dateFrom || !this._state.dateEnd) {
      this.shake();
      return;
    }

    this.#onFormSubmit(EventEditView.parseStateToEvent(this._state));
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCloseClick();
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();
    if (this._state.id) {
      this.#onDeleteClick(EventEditView.parseStateToEvent(this._state));
    } else {
      this.#onCloseClick();
    }
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
    const value = evt.target.value.replace(/[^0-9]/g, '');

    evt.target.setCustomValidity('');

    this._setState({
      basePrice: Number(value) || 0,
    });
    evt.target.value = value;
  };

  static parseEventToState(event) {
    return {
      id: event?.id || '',
      type: event?.type || 'flight',
      destination: event?.destination || '',
      dateFrom: event?.dateFrom || '',
      dateEnd: event?.dateEnd || '',
      basePrice: event?.basePrice || 0,
      offers: Array.isArray(event?.offers) ? [...event.offers] : [],
      isFavorite: event?.isFavorite || false,
      isEditMode: Boolean(event?.id),
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToEvent(state) {
    const event = { ...state };

    delete event.isDisabled;
    delete event.isSaving;
    delete event.isDeleting;
    delete event.isEditMode;

    return event;
  }
}
