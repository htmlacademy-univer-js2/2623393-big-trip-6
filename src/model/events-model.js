import { events, destinations, offers } from '../mock/events.js';

export default class EventsModel {
  constructor() {
    this._events = events;
    this._destinations = destinations;
    this._offers = offers;
  }

  getEvents() {
    return this._events;
  }

  getDestinations() {
    return this._destinations;
  }

  getOffers() {
    return this._offers;
  }

  getDestinationById(id) {
    return this._destinations.find((destination) => destination.id === id);
  }

  getOffersByType(type) {
    const offerGroup = this._offers.find((offer) => offer.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  getOfferById(type, id) {
    const typeOffers = this.getOffersByType(type);
    return typeOffers.find((offer) => offer.id === id);
  }

  updateEvent(update) {
    const index = this._events.findIndex((event) => event.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting event');
    }

    this._events = [
      ...this._events.slice(0, index),
      update,
      ...this._events.slice(index + 1),
    ];
  }

  addEvent(update) {
    this._events = [update, ...this._events];
  }

  deleteEvent(event) {
    const index = this._events.findIndex((e) => e.id === event.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting event');
    }

    this._events = [
      ...this._events.slice(0, index),
      ...this._events.slice(index + 1),
    ];
  }
}
