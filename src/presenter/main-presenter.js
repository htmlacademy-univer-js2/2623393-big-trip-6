import { render, remove } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import EventsModel from '../model/events-model.js';
import PointPresenter from './point-presenter.js';
import { FilterType, SortType } from '../const.js';

export default class MainPresenter {
  #eventsModel = new EventsModel();
  #eventsListComponent = document.createElement('ul');

  #pointPresenters = new Map();

  #filtersComponent = null;
  #sortComponent = null;
  #emptyListComponent = null;
  #loadingComponent = null;
  #errorComponent = null;

  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;
  #isLoading = true;
  #isError = false;

  #handlePointChange = (updatedPoint) => {
    this.#eventsModel.updateEvent(updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(event) {
    const pointPresenter = new PointPresenter({
      eventListContainer: this.#eventsListComponent,
      eventsModel: this.#eventsModel,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange
    });

    pointPresenter.init(event);
    this.#pointPresenters.set(event.id, pointPresenter);
  }

  async init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');

    this.#filtersComponent = new FiltersView(
      this.#currentFilter,
      (filterType) => this.#handleFilterChange(filterType)
    );
    render(this.#filtersComponent, filtersContainer);

    this.#eventsListComponent.classList.add('trip-events__list');

    this.#showLoading();

    try {
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
    const eventsSection = document.querySelector('.trip-events');

    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new SortView(
      this.#currentSort,
      (sortType) => this.#handleSortChange(sortType)
    );
    render(this.#sortComponent, eventsSection, 'afterbegin');

    if (events.length === 0) {
      this.#showEmptyList();
      return;
    }

    document.querySelector('.trip-events').append(this.#eventsListComponent);

    events.forEach((event) => {
      this.#renderPoint(event);
    });

    this.#updateFiltersAvailability();
  }

  #getFilteredAndSortedEvents() {
    let events = this.#eventsModel.getEvents();
    events = this.#filterEvents(events);
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
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

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
  }

  #handleFilterChange(filterType) {
    this.#currentFilter = filterType;
    this.#filtersComponent.updateFilter(filterType);
    this.#currentSort = SortType.DAY;
    this.#renderEvents();
  }

  #handleSortChange(sortType) {
    if (this.#currentSort === sortType) {
      return;
    }

    this.#currentSort = sortType;
    this.#renderEvents();
  }
}
