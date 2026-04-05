import { render, replace } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EventEditView from '../view/event-edit-view.js';
import EventView from '../view/event-view.js';
import EventsModel from '../model/events-model.js';

export default class MainPresenter {
  #eventsModel = new EventsModel();
  #eventsListComponent = document.createElement('ul');
  #eventComponents = new Map();
  #currentEditComponent = null;

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');

    render(new FiltersView(), filtersContainer);
    render(new SortView(), eventsSection);

    this.#eventsListComponent.classList.add('trip-events__list');
    eventsSection.append(this.#eventsListComponent);

    this.#renderEvents();
  }

  #renderEvents() {
    const events = this.#eventsModel.getEvents();
    events.forEach((event) => {
      const eventView = this.#createEventView(event);
      render(eventView, this.#eventsListComponent);
      this.#eventComponents.set(event.id, eventView);
    });
  }

  #createEventView(event) {
    const destination = this.#eventsModel.getDestinationById(event.destination);
    const eventOffers = event.offers
      .map((id) => this.#eventsModel.getOfferById(event.type, id))
      .filter(Boolean);

    return new EventView(
      event,
      destination,
      eventOffers,
      () => this.#handleRollupClick(event)
    );
  }

  #handleRollupClick(event) {
    if (this.#currentEditComponent) {
      this.#closeForm();
    }

    const eventView = this.#eventComponents.get(event.id);
    const editView = new EventEditView(
      event,
      this.#eventsModel.getDestinations(),
      this.#eventsModel.getOffers(),
      () => this.#handleFormSubmit(event, editView),
      () => this.#closeForm(),
      () => this.#handleDelete(event, editView)
    );

    replace(editView, eventView);
    this.#currentEditComponent = { view: editView, originalEventView: eventView };
    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  #closeForm() {
    if (!this.#currentEditComponent) {
      return;
    }

    const { view: editView, originalEventView: eventView } = this.#currentEditComponent;
    replace(eventView, editView);
    this.#currentEditComponent = null;
    document.removeEventListener('keydown', this.#escKeydownHandler);
  }

  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closeForm();
    }
  };

  // eslint-disable-next-line no-unused-vars
  #handleFormSubmit(event, editView) {
    this.#closeForm();
  }

  // eslint-disable-next-line no-unused-vars
  #handleDelete(event, editView) {
    this.#closeForm();
  }
}
