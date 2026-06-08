import TripInfoView from '../view/trip-info-view.js';
import { render, replace, remove } from '../framework/render.js';

export default class TripInfoPresenter {
  #tripInfoContainer = null;
  #eventsModel = null;
  #tripInfoComponent = null;

  constructor({ tripInfoContainer, eventsModel }) {
    this.#tripInfoContainer = tripInfoContainer;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#eventsModel.addObserver(this.#modelEventHandler);
    this.#renderTripInfo();
  }

  #modelEventHandler = () => {
    this.#renderTripInfo();
  };

  #renderTripInfo() {
    const events = this.#eventsModel.getEvents();

    if (events.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    const route = this.#calculateRoute(events);
    const { startDate, endDate } = this.#calculateDates(events);
    const totalCost = this.#calculateTotalCost(events);

    const prevTripInfoComponent = this.#tripInfoComponent;

    this.#tripInfoComponent = new TripInfoView({
      route,
      startDate,
      endDate,
      totalCost,
    });

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, 'afterbegin');
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
  }

  #calculateRoute(events) {
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.dateFrom) - new Date(b.dateFrom)
    );

    const destinations = sortedEvents.map((event) => {
      const destination = this.#eventsModel.getDestinationById(event.destination);
      return destination ? destination.name : '';
    }).filter(Boolean);

    const uniqueDestinations = destinations.filter((dest, index) =>
      destinations.indexOf(dest) === index
    );

    if (uniqueDestinations.length === 0) {
      return '';
    }

    if (uniqueDestinations.length <= 3) {
      return uniqueDestinations.join(' — ');
    }

    return `${uniqueDestinations[0]} — ... — ${uniqueDestinations[uniqueDestinations.length - 1]}`;
  }

  #calculateDates(events) {
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.dateFrom) - new Date(b.dateFrom)
    );

    const startDate = new Date(sortedEvents[0].dateFrom);
    const endDate = new Date(sortedEvents[sortedEvents.length - 1].dateEnd);

    return { startDate, endDate };
  }

  #calculateTotalCost(events) {
    return events.reduce((total, event) => {
      let eventCost = event.basePrice;

      event.offers.forEach((offerId) => {
        const offer = this.#eventsModel.getOfferById(event.type, offerId);
        if (offer) {
          eventCost += offer.price;
        }
      });

      return total + eventCost;
    }, 0);
  }
}
