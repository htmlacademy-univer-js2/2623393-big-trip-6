import { render, remove } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import EventsModel from '../model/events-model.js';
import FilterModel from '../model/filter-model.js';
import FilterPresenter from './filter-presenter.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { FilterType, SortType, UserAction } from '../const.js';

export default class MainPresenter {
  #eventsModel = new EventsModel();
  #filterModel = new FilterModel();
  #eventsListComponent = document.createElement('ul');

  #pointPresenters = new Map();
  #newPointPresenter = null;

  #filterPresenter = null;
  #sortComponent = null;
  #emptyListComponent = null;
  #loadingComponent = null;
  #errorComponent = null;

  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;
  #isLoading = true;
  #isError = false;
  #isCreatingNewPoint = false;

  constructor() {
    this.#handleFilterChange = this.#handleFilterChange.bind(this);
    this.#handleSortChange = this.#handleSortChange.bind(this);
    this.#handleModelEvent = this.#handleModelEvent.bind(this);
    this.#handleUserAction = this.#handleUserAction.bind(this);
    this.#handleNewEventClick = this.#handleNewEventClick.bind(this);
  }

  #handleModelEvent = () => {
    this.#currentFilter = this.#filterModel.getFilter();
    this.#currentSort = SortType.DAY;
    this.#renderEvents();
  };

  #handleFilterChange = () => {
    this.#currentFilter = this.#filterModel.getFilter();
    this.#currentSort = SortType.DAY;
    this.#renderEvents();
  };

  #handleSortChange = (sortType) => {
    if (this.#currentSort === sortType) {
      return;
    }
    this.#currentSort = sortType;
    this.#renderEvents();
  };

  #handleUserAction = (actionType, update) => {
    const updateType = 'MINOR';

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventsModel.updateEvent(updateType, update);
        break;
      case UserAction.ADD_EVENT:
        this.#eventsModel.addEvent(updateType, update);
        break;
      case UserAction.DELETE_EVENT:
        this.#eventsModel.deleteEvent(updateType, update);
        break;
    }
  };

  #handleNewEventClick = () => {
    if (this.#isCreatingNewPoint) {
      return;
    }

    this.#filterModel.setFilter(FilterType.EVERYTHING);
    this.#currentSort = SortType.DAY;

    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    this.#isCreatingNewPoint = true;
    this.#showNewPointForm();
  };

  #hideNewPointForm = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
    this.#isCreatingNewPoint = false;
    this.#renderEvents();
  };

  #showNewPointForm = () => {
    this.#clearEventsList();

    this.#newPointPresenter = new NewPointPresenter({
      eventListContainer: this.#eventsListComponent,
      eventsModel: this.#eventsModel,
      onClose: this.#hideNewPointForm,
      onSave: (newEvent) => {
        const eventWithId = {
          ...newEvent,
          id: crypto.randomUUID() // Либо используйте nanoid(), если она установлена в проекте
        };
        this.#handleUserAction(UserAction.ADD_EVENT, eventWithId);
        this.#hideNewPointForm();
      },
    });

    this.#newPointPresenter.init();
    document.querySelector('.trip-events').append(this.#eventsListComponent);
  };

  #handlePointChange = (updatedPoint) => {
    this.#handleUserAction(UserAction.UPDATE_EVENT, updatedPoint);
  };

  #handleModeChange = () => {
    if (this.#isCreatingNewPoint && this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
      this.#isCreatingNewPoint = false;
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(event) {
    const pointPresenter = new PointPresenter({
      eventListContainer: this.#eventsListComponent,
      eventsModel: this.#eventsModel,
      onDataChange: this.#handleUserAction,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(event);
    this.#pointPresenters.set(event.id, pointPresenter);
  }

  async init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const newEventButton = document.querySelector('.trip-main__event-add-btn');

    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleFilterChange);

    this.#filterPresenter = new FilterPresenter({
      filterContainer: filtersContainer,
      filterModel: this.#filterModel,
      eventsModel: this.#eventsModel,
      onFilterChange: this.#handleFilterChange,
      onSortReset: () => {
        this.#currentSort = SortType.DAY;
      },
    });
    this.#filterPresenter.init();

    newEventButton.addEventListener('click', this.#handleNewEventClick);
    this.#eventsListComponent.classList.add('trip-events__list');

    this.#showLoading();

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
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
    if (this.#isCreatingNewPoint) {
      return;
    }

    this.#clearEventsList();

    const events = this.#getFilteredAndSortedEvents();
    const eventsSection = document.querySelector('.trip-events');

    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new SortView(
      this.#currentSort,
      this.#handleSortChange,
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
    const filterType = this.#filterModel.getFilter();

    switch (filterType) {
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

    if (this.#filterPresenter) {
      this.#filterPresenter.setFilterDisabled(FilterType.FUTURE, !hasFuture);
      this.#filterPresenter.setFilterDisabled(FilterType.PRESENT, !hasPresent);
      this.#filterPresenter.setFilterDisabled(FilterType.PAST, !hasPast);
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
}
