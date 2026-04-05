import { render } from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EventEditView from '../view/event-edit-view.js';
import EventView from '../view/event-view.js';
import EventsModel from '../model/events-model.js';

export default class MainPresenter {
  constructor() {
    this.eventsModel = new EventsModel();
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');

    const filtersComponent = new FiltersView();
    render(filtersComponent, filtersContainer);

    const sortComponent = new SortView();
    render(sortComponent, eventsSection);

    const listContainer = document.createElement('ul');
    listContainer.classList.add('trip-events__list');
    eventsSection.append(listContainer);

    const editComponent = new EventEditView(
      null,
      this.eventsModel.getDestinations(),
      this.eventsModel.getOffers()
    );
    const editListItem = document.createElement('li');
    editListItem.classList.add('trip-events__item');
    render(editComponent, editListItem);
    listContainer.append(editListItem);

    const events = this.eventsModel.getEvents();
    events.forEach((event) => {
      const destination = this.eventsModel.getDestinationById(event.destination);
      const eventOffers = event.offers.map((offerId) =>
        this.eventsModel.getOfferById(event.type, offerId)
      ).filter(Boolean);

      const eventComponent = new EventView(event, destination, eventOffers);
      const eventListItem = document.createElement('li');
      eventListItem.classList.add('trip-events__item');
      render(eventComponent, eventListItem);
      listContainer.append(eventListItem);
    });
  }
}
