import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class BigTripApiService extends ApiService {
  get events() {
    return this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }

  async updateEvent(event) {
    const response = await this._load({
      url: `points/${event.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(event)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  async addEvent(event) {
    const adaptedEvent = this.#adaptToServer(event);
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(adaptedEvent),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  async deleteEvent(event) {
    const response = await this._load({
      url: `points/${event.id}`,
      method: Method.DELETE,
    });

    return response;
  }

  #adaptToServer(event) {
    const adaptedEvent = {
      ...event,
      'base_price': event.basePrice,
      'date_from': event.dateFrom instanceof Date ? event.dateFrom.toISOString() : event.dateFrom,
      'date_to': event.dateEnd instanceof Date ? event.dateEnd.toISOString() : event.dateEnd,
      'is_favorite': event.isFavorite,
    };

    delete adaptedEvent.basePrice;
    delete adaptedEvent.dateFrom;
    delete adaptedEvent.dateEnd;
    delete adaptedEvent.isFavorite;

    if (!adaptedEvent.id) {
      delete adaptedEvent.id;
    }

    return adaptedEvent;
  }
}
