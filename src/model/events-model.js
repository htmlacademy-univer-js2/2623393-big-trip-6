import Observable from '../framework/observable.js';

export default class EventsModel extends Observable {
  #apiService = null;
  #events = [];
  #destinations = [];
  #offers = [];

  constructor({ apiService }) {
    super();
    this.#apiService = apiService;
  }

  getEvents() {
    return this.#events;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getOffersByType(type) {
    const offerGroup = this.#offers.find((offer) => offer.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  getOfferById(type, id) {
    const typeOffers = this.getOffersByType(type);
    return typeOffers.find((offer) => offer.id === id);
  }

  async init() {
    try {
      const serverEvents = await this.#apiService.events;
      this.#destinations = await this.#apiService.destinations;
      this.#offers = await this.#apiService.offers;

      this.#events = serverEvents.map(this.#adaptToClient);

      this._notify('INIT', { isError: false });
    } catch (err) {
      this.#events = [];
      this.#destinations = [];
      this.#offers = [];

      this._notify('INIT', { isError: true });
    }
  }

  // Обновление точки на сервере
  async updateEvent(updateType, update) {
    const index = this.#events.findIndex((event) => event.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting event');
    }

    try {
      const response = await this.#apiService.updateEvent(update);
      const updatedEvent = this.#adaptToClient(response);

      this.#events = [
        ...this.#events.slice(0, index),
        updatedEvent,
        ...this.#events.slice(index + 1),
      ];

      this._notify(updateType, updatedEvent);
    } catch (err) {
      throw new Error('Can\'t update event on server');
    }
  }

  #adaptToClient(event) {
    const adaptedEvent = {
      ...event,
      basePrice: event['base_price'],
      dateFrom: event['date_from'],
      dateEnd: event['date_to'],
      isFavorite: event['is_favorite'],
    };

    delete adaptedEvent['base_price'];
    delete adaptedEvent['date_from'];
    delete adaptedEvent['date_to'];
    delete adaptedEvent['is_favorite'];

    return adaptedEvent;
  }
}
