import { render, remove } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import FilterPresenter from './filter-presenter.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { FilterType, SortType, UserAction } from '../const.js';
import TripInfoPresenter from './trip-info-presenter.js';

export default class MainPresenter {
  #eventsModel = null;
  #filterModel = null;
  #eventsListComponent = document.createElement('ul');
  #tripEventsElement = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;

  #filterPresenter = null;
  #sortComponent = null;
  #emptyListComponent = null;
  #loadingComponent = null;
  #errorComponent = null;
  #tripInfoPresenter = null;
  #newEventButton = null;

  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;
  #isLoading = true;
  #isError = false;
  #isCreatingNewPoint = false;

  constructor({ eventsModel, filterModel }) {
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;

    this.#filterChangeHandler = this.#filterChangeHandler.bind(this);
    this.#sortChangeHandler = this.#sortChangeHandler.bind(this);
    this.#modelEventHandler = this.#modelEventHandler.bind(this);
    this.#userActionHandler = this.#userActionHandler.bind(this);
    this.#newEventClickHandler = this.#newEventClickHandler.bind(this);
  }

  #modelEventHandler = (updateType, data) => {
    if (updateType === 'INIT') {
      this.#isLoading = false;
      if (data && data.isError) {
        this.#isError = true;
        this.#showError();
        return;
      }
      this.#renderEvents();
      return;
    }
    this.#renderEvents();
  };

  #filterChangeHandler = () => {
    this.#currentFilter = this.#filterModel.getFilter();
    this.#currentSort = SortType.DAY;
    this.#renderEvents();
  };

  #sortChangeHandler = (sortType) => {
    if (this.#currentSort === sortType) {
      return;
    }
    this.#currentSort = sortType;
    this.#renderEvents();
  };

  #userActionHandler = async (actionType, update) => {
    const updateType = 'MINOR';

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        try {
          await this.#eventsModel.updateEvent(updateType, update);
        } catch (err) {
          throw new Error(err);
        }
        break;
      case UserAction.ADD_EVENT:
        try {
          await this.#eventsModel.addEvent(updateType, update);
        } catch (err) {
          throw new Error(err);
        }
        break;
      case UserAction.DELETE_EVENT:
        try {
          await this.#eventsModel.deleteEvent(updateType, update);
        } catch (err) {
          throw new Error(err);
        }
        break;
    }
  };

  #newEventClickHandler = () => {
    if (this.#isCreatingNewPoint) {
      return;
    }

    this.#filterModel.setFilter(FilterType.EVERYTHING);
    this.#currentSort = SortType.DAY;

    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    this.#isCreatingNewPoint = true;
    this.#newEventButton.disabled = true;
    this.#showNewPointForm();
  };

  #hideNewPointForm = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
    this.#isCreatingNewPoint = false;
    this.#newEventButton.disabled = false;
    this.#renderEvents();
  };

  #showNewPointForm = () => {
    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
      this.#emptyListComponent = null;
    }

    this.#newPointPresenter = new NewPointPresenter({
      eventListContainer: this.#eventsListComponent,
      eventsModel: this.#eventsModel,
      onClose: this.#hideNewPointForm,
      onSave: async (newEvent) => {
        const eventWithId = {
          ...newEvent,
        };
        await this.#userActionHandler(UserAction.ADD_EVENT, eventWithId);
        this.#hideNewPointForm();
      },
    });

    this.#newPointPresenter.init();
  };

  #modeChangeHandler = () => {
    if (this.#isCreatingNewPoint && this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
      this.#isCreatingNewPoint = false;
      this.#newEventButton.disabled = false;
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(event) {
    const pointPresenter = new PointPresenter({
      eventListContainer: this.#eventsListComponent,
      eventsModel: this.#eventsModel,
      onDataChange: this.#userActionHandler,
      onModeChange: this.#modeChangeHandler,
    });

    pointPresenter.init(event);
    this.#pointPresenters.set(event.id, pointPresenter);
  }

  async init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
    this.#tripEventsElement = document.querySelector('.trip-events');

    this.#eventsModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#filterChangeHandler);

    this.#filterPresenter = new FilterPresenter({
      filterContainer: filtersContainer,
      filterModel: this.#filterModel,
      eventsModel: this.#eventsModel,
      onFilterChange: this.#filterChangeHandler,
      onSortReset: () => {
        this.#currentSort = SortType.DAY;
      },
    });
    this.#filterPresenter.init();

    const tripMainContainer = document.querySelector('.trip-main');

    this.#tripInfoPresenter = new TripInfoPresenter({
      tripInfoContainer: tripMainContainer,
      eventsModel: this.#eventsModel,
    });
    this.#tripInfoPresenter.init();

    this.#newEventButton.addEventListener('click', this.#newEventClickHandler);
    this.#eventsListComponent.classList.add('trip-events__list');
    this.#tripEventsElement.append(this.#eventsListComponent);

    this.#showLoading();
  }

  #showLoading() {
    this.#clearEventsList();
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#eventsListComponent);
  }

  #showError() {
    this.#clearEventsList();
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#eventsListComponent);
    this.#updateFiltersAvailability();
  }

  #showEmptyList() {
    this.#clearEventsList();
    this.#emptyListComponent = new EmptyListView(this.#currentFilter);
    render(this.#emptyListComponent, this.#eventsListComponent);
    this.#updateFiltersAvailability();
  }

  #renderEvents() {
    this.#clearEventsList();

    const events = this.#getFilteredAndSortedEvents();

    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new SortView(
      this.#currentSort,
      this.#sortChangeHandler,
    );
    render(this.#sortComponent, this.#tripEventsElement, 'afterbegin');

    if (events.length === 0 && !this.#isCreatingNewPoint) {
      this.#showEmptyList();
      return;
    }

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

    if (events.length === 0) {
      if (this.#filterPresenter) {
        this.#filterPresenter.setFilterDisabled(FilterType.EVERYTHING, true);
        this.#filterPresenter.setFilterDisabled(FilterType.FUTURE, true);
        this.#filterPresenter.setFilterDisabled(FilterType.PRESENT, true);
        this.#filterPresenter.setFilterDisabled(FilterType.PAST, true);
      }
      return;
    }

    const hasFuture = events.some((event) => new Date(event.dateFrom) > now);
    const hasPresent = events.some((event) => {
      const start = new Date(event.dateFrom);
      const end = new Date(event.dateEnd);
      return start <= now && end >= now;
    });
    const hasPast = events.some((event) => new Date(event.dateEnd) < now);

    if (this.#filterPresenter) {
      this.#filterPresenter.setFilterDisabled(FilterType.EVERYTHING, events.length === 0);
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
