import { render, replace, remove } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EventEditView from '../view/event-edit-view.js';
import EventView from '../view/event-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import EventsModel from '../model/events-model.js';
import { FilterType, SortType } from '../const.js';

export default class MainPresenter {
  #eventsModel = new EventsModel();
  #eventsListComponent = document.createElement('ul');
  #eventComponents = new Map();
  #currentEditComponent = null;

  #filtersComponent = null;
  #sortComponent = null;
  #emptyListComponent = null;
  #loadingComponent = null;
  #errorComponent = null;

  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;
  #isLoading = true;
  #isError = false;

  async init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');

    // Инициализация фильтров
    this.#filtersComponent = new FiltersView(
      this.#currentFilter,
      (filterType) => this.#handleFilterChange(filterType)
    );
    render(this.#filtersComponent, filtersContainer);

    // Инициализация сортировки
    this.#sortComponent = new SortView(
      this.#currentSort,
      (sortType) => this.#handleSortChange(sortType)
    );
    render(this.#sortComponent, eventsSection);

    this.#eventsListComponent.classList.add('trip-events__list');

    // Показываем загрузку
    this.#showLoading();

    try {
      // Здесь будет запрос к серверу
      // await this.#eventsModel.loadEvents();
      this.#isLoading = false;
      this.#isError = false;
      this.#renderEvents();
    } catch (err) {
      this.#isLoading = false;
      this.#isError = true;
      this.#showError();
    }
  }

  #showLoading() {
    this.#clearEventsList();
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#eventsListComponent);
    document.querySelector('.trip-events').append(this.#eventsListComponent);
  }

  #showError() {
    this.#clearEventsList();
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#eventsListComponent);
    document.querySelector('.trip-events').append(this.#eventsListComponent);

    // Блокируем все фильтры
    this.#updateFiltersAvailability();
  }

  #showEmptyList() {
    this.#clearEventsList();
    this.#emptyListComponent = new EmptyListView(this.#currentFilter);
    render(this.#emptyListComponent, this.#eventsListComponent);
    document.querySelector('.trip-events').append(this.#eventsListComponent);

    this.#updateFiltersAvailability();
  }

  #renderEvents() {
    this.#clearEventsList();

    const events = this.#getFilteredAndSortedEvents();

    if (events.length === 0) {
      this.#showEmptyList();
      return;
    }

    document.querySelector('.trip-events').append(this.#eventsListComponent);

    events.forEach((event) => {
      const eventView = this.#createEventView(event);
      render(eventView, this.#eventsListComponent);
      this.#eventComponents.set(event.id, eventView);
    });

    this.#updateFiltersAvailability();
  }

  #getFilteredAndSortedEvents() {
    let events = this.#eventsModel.getEvents();

    // Применяем фильтр
    events = this.#filterEvents(events);

    // Применяем сортировку
    events = this.#sortEvents(events);

    return events;
  }

  #filterEvents(events) {
    const now = new Date();

    switch (this.#currentFilter) {
      case FilterType.FUTURE:
        return events.filter((event) => new Date(event.dateFrom) > now);
      case FilterType.PRESENT:
        return events.filter((event) => {
          const start = new Date(event.dateFrom);
          const end = new Date(event.dateEnd);
          return start <= now && end >= now;
        });
      case FilterType.PAST:
        return events.filter((event) => new Date(event.dateEnd) < now);
      default:
        return events;
    }
  }

  #sortEvents(events) {
    switch (this.#currentSort) {
      case SortType.TIME:
        return events.sort((a, b) => {
          const durationA = new Date(a.dateEnd) - new Date(a.dateFrom);
          const durationB = new Date(b.dateEnd) - new Date(b.dateFrom);
          return durationB - durationA;
        });
      case SortType.PRICE:
        return events.sort((a, b) => b.basePrice - a.basePrice);
      default:
        return events.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }
  }

  #updateFiltersAvailability() {
    const events = this.#eventsModel.getEvents();
    const now = new Date();

    const hasFuture = events.some((event) => new Date(event.dateFrom) > now);
    const hasPresent = events.some((event) => {
      const start = new Date(event.dateFrom);
      const end = new Date(event.dateEnd);
      return start <= now && end >= now;
    });
    const hasPast = events.some((event) => new Date(event.dateEnd) < now);

    if (this.#filtersComponent) {
      this.#filtersComponent.setDisabled(FilterType.FUTURE, !hasFuture);
      this.#filtersComponent.setDisabled(FilterType.PRESENT, !hasPresent);
      this.#filtersComponent.setDisabled(FilterType.PAST, !hasPast);
    }
  }

  #clearEventsList() {
    this.#eventComponents.forEach((component) => {
      remove(component);
    });
    this.#eventComponents.clear();

    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }

    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }

    if (this.#errorComponent) {
      remove(this.#errorComponent);
      this.#errorComponent = null;
    }

    if (this.#currentEditComponent) {
      remove(this.#currentEditComponent.view);
      this.#currentEditComponent = null;
    }
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

  #handleFilterChange(filterType) {
    this.#currentFilter = filterType;
    this.#filtersComponent.updateFilter(filterType);
    this.#currentSort = SortType.DAY; // Сбрасываем сортировку
    this.#renderEvents();
  }

  #handleSortChange(sortType) {
    this.#currentSort = sortType;
    this.#renderEvents();
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

  #handleFormSubmit() {
    // TODO: логика сохранения
    this.#closeForm();
  }

  #handleDelete() {
    // TODO: логика удаления
    this.#closeForm();
  }
}
